package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Coupon;
import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderDetail;
import com.amigoscode.Entity.OrderStatus;
import com.amigoscode.Entity.PaymentStatus;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderItemRequest;
import com.amigoscode.dto.OrderItemResponse;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.EmailService;
import com.amigoscode.service.OrderService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final EmailService emailService;

    public OrderServiceImpl(OrderRepository orderRepository,
                            BookRepository bookRepository,
                            UserRepository userRepository,
                            CouponRepository couponRepository,
                            EmailService emailService) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.couponRepository = couponRepository;
        this.emailService = emailService;
    }

    // ─── COD (immediate) order ────────────────────────────────────

    @Override
    @Transactional
    public Order placeOrder(String username, OrderRequest request) {
        User user = findUser(username);

        Order order = initOrder(user, request);
        order.setPaymentMethod("COD");
        order.setPaymentStatus(null); // COD has no electronic payment status

        BuildResult result = buildOrderItems(request, order);
        applyPricing(order, result.subtotal, result.details, request.getCouponCode(), true);

        Order saved = orderRepository.save(order);
        emailService.sendOrderConfirmationEmail(user, saved);
        return saved;
    }

    // ─── VNPay pending order ──────────────────────────────────────

    /**
     * Creates an order in PENDING state for VNPay.
     * Stock is NOT deducted yet — that happens in {@link #confirmPayment}.
     */
    @Override
    @Transactional
    public Order placeOrderPending(String username, OrderRequest request, String paymentMethod) {
        User user = findUser(username);

        Order order = initOrder(user, request);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus(PaymentStatus.PENDING);

        BuildResult result = buildOrderItems(request, order);
        // Do NOT increment usedCount yet — coupon applied only after payment confirmation
        applyPricing(order, result.subtotal, result.details, request.getCouponCode(), false);

        Order saved = orderRepository.save(order);
        saved.setVnpayTxnRef(saved.getId() + "_" + System.currentTimeMillis());
        return orderRepository.save(saved);
    }

    // ─── VNPay callback ───────────────────────────────────────────

    /** Confirms payment: deducts stock and marks coupon used — exactly once (idempotent). */
    @Override
    @Transactional
    public boolean confirmPayment(Long orderId, String txnRef, long paidAmount) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        validatePaymentIdentity(order, txnRef);

        if (PaymentStatus.PAID.equals(order.getPaymentStatus())) {
            return false; // Already processed — idempotent
        }
        if (!PaymentStatus.PENDING.equals(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Order is not awaiting payment");
        }

        // VNPay sends amount × 100; convert back to compare
        long expectedAmount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
        if (paidAmount != expectedAmount) {
            throw new IllegalArgumentException("Payment amount does not match order total");
        }

        // Pessimistic-lock each book before deducting stock
        List<Book> lockedBooks = new ArrayList<>();
        if (order.getOrderDetails() != null) {
            for (OrderDetail detail : order.getOrderDetails()) {
                Book book = bookRepository.findByIdForUpdate(detail.getBook().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Book not found: " + detail.getBook().getId()));
                if (book.getStock() < detail.getQuantity()) {
                    throw new IllegalArgumentException("Không đủ hàng: " + book.getTitle());
                }
                lockedBooks.add(book);
            }

            for (int i = 0; i < order.getOrderDetails().size(); i++) {
                OrderDetail detail = order.getOrderDetails().get(i);
                Book book = lockedBooks.get(i);
                book.setStock(book.getStock() - detail.getQuantity());
                book.setSoldCount((book.getSoldCount() == null ? 0 : book.getSoldCount()) + detail.getQuantity());
                bookRepository.save(book);
            }
        }

        // Mark coupon as used (only on successful payment)
        if (order.getCouponCode() != null) {
            couponRepository.findByCodeForUpdate(order.getCouponCode()).ifPresent(coupon -> {
                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);
            });
        }

        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.Processing);
        orderRepository.save(order);
        emailService.sendOrderConfirmationEmail(order.getUser(), order);
        return true;
    }

    @Override
    @Transactional
    public void failPayment(Long orderId, String txnRef) {
        Order order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        validatePaymentIdentity(order, txnRef);
        if (PaymentStatus.PAID.equals(order.getPaymentStatus())
                || PaymentStatus.FAILED.equals(order.getPaymentStatus())) {
            return; // Already in a terminal state
        }
        if (!PaymentStatus.PENDING.equals(order.getPaymentStatus())) {
            throw new IllegalArgumentException("Order is not awaiting payment");
        }

        order.setPaymentStatus(PaymentStatus.FAILED);
        order.setStatus(OrderStatus.Cancelled);
        orderRepository.save(order);
    }

    // ─── Queries ──────────────────────────────────────────────────

    @Override
    public List<OrderHistoryResponse> getMyOrderHistory(String username) {
        return orderRepository.findByUserUsername(username).stream().map(order -> {
            OrderHistoryResponse response = new OrderHistoryResponse();
            response.setId(order.getId());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());
            response.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
            response.setItems(order.getOrderDetails().stream()
                    .map(d -> new OrderItemResponse(d.getBook().getTitle(), d.getQuantity(), d.getPrice()))
                    .toList());
            return response;
        }).toList();
    }

    @Override
    public Page<AdminOrderResponse> getAllOrdersForAdmin(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "orderDate"));
        return orderRepository.findAll(pageable).map(order -> {
            AdminOrderResponse dto = new AdminOrderResponse();
            dto.setId(order.getId());
            dto.setOrderDate(order.getOrderDate());
            dto.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
            dto.setUsername(order.getUser() != null ? order.getUser().getUsername() : "N/A");
            dto.setEmail(order.getUser() != null ? order.getUser().getEmail() : "N/A");
            dto.setShippingAddress(order.getShippingAddress());
            dto.setShippingMethod(order.getShippingMethod());
            dto.setCouponCode(order.getCouponCode());
            dto.setSubtotal(order.getSubtotal());
            dto.setDiscountAmount(order.getDiscountAmount());
            dto.setShippingFee(order.getShippingFee());
            dto.setTotalAmount(order.getTotalAmount());
            if (order.getOrderDetails() != null) {
                dto.setItems(order.getOrderDetails().stream()
                        .map(d -> new OrderItemResponse(
                                d.getBook() != null ? d.getBook().getTitle() : "N/A",
                                d.getQuantity(),
                                d.getPrice()))
                        .toList());
            }
            return dto;
        });
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }

    @Override
    public String getOrderOwnerUsername(Long orderId) {
        return orderRepository.findById(orderId)
                .map(o -> o.getUser() != null ? o.getUser().getUsername() : null)
                .orElse(null);
    }

    // ─── Private helpers (DRY) ────────────────────────────────────

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));
    }

    private Order initOrder(User user, OrderRequest request) {
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus(OrderStatus.Pending);
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingMethod(request.getShippingMethod());
        order.setShippingFee(calcShippingFee(request.getShippingMethod()));
        return order;
    }

    /**
     * Validates stock, builds {@link OrderDetail} list, and computes the subtotal.
     * Does NOT deduct stock — caller decides when/whether to deduct.
     */
    private BuildResult buildOrderItems(OrderRequest request, Order order) {
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderDetail> details = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found: " + itemRequest.getBookId()));

            if (book.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Không đủ hàng: " + book.getTitle());
            }

            subtotal = subtotal.add(book.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setBook(book);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setPrice(book.getPrice());
            details.add(detail);
        }
        return new BuildResult(subtotal, details);
    }

    /**
     * Applies coupon discount, sets all monetary fields, and attaches details to the order.
     *
     * @param deductStockAndMarkCoupon {@code true} for COD (immediate), {@code false} for VNPay pending.
     */
    private void applyPricing(Order order,
                               BigDecimal subtotal,
                               List<OrderDetail> details,
                               String couponCode,
                               boolean deductStockAndMarkCoupon) {
        // Deduct stock immediately only for COD orders
        if (deductStockAndMarkCoupon) {
            for (OrderDetail detail : details) {
                Book book = detail.getBook();
                book.setStock(book.getStock() - detail.getQuantity());
                book.setSoldCount((book.getSoldCount() == null ? 0 : book.getSoldCount()) + detail.getQuantity());
                bookRepository.save(book);
            }
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (couponCode != null && !couponCode.isBlank()) {
            Coupon coupon = couponRepository.findByCode(couponCode.trim().toUpperCase()).orElse(null);
            if (coupon != null && coupon.isActive()
                    && subtotal.compareTo(coupon.getMinOrderValue()) >= 0) {
                discountAmount = calcDiscount(coupon, subtotal);
                if (deductStockAndMarkCoupon) {
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                }
                order.setCouponCode(coupon.getCode());
            }
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotal.add(order.getShippingFee()).subtract(discountAmount));
        order.setOrderDetails(details);
    }

    /** Calculates the actual discount amount for a coupon against the given subtotal. */
    private BigDecimal calcDiscount(Coupon coupon, BigDecimal subtotal) {
        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(coupon.getMaxDiscount());
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        return discount.min(subtotal);
    }

    private BigDecimal calcShippingFee(String method) {
        if (method == null) return BigDecimal.ZERO;
        return switch (method.toUpperCase()) {
            case "EXPRESS"  -> BigDecimal.valueOf(20_000);
            case "SAME_DAY" -> BigDecimal.valueOf(50_000);
            default         -> BigDecimal.ZERO; // STANDARD = free
        };
    }

    private void validatePaymentIdentity(Order order, String txnRef) {
        if (!"VNPAY".equals(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Order is not a VNPay order");
        }
        if (txnRef == null || !txnRef.equals(order.getVnpayTxnRef())) {
            throw new IllegalArgumentException("Payment reference does not match order");
        }
    }

    /** Value-carrier returned by {@link #buildOrderItems}. */
    private record BuildResult(BigDecimal subtotal, List<OrderDetail> details) {}
}
