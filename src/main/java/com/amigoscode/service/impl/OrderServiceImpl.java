package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Coupon;
import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderDetail;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderItemResponse;
import com.amigoscode.dto.OrderItemRequest;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.EmailService;
import com.amigoscode.service.OrderService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

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

    @Override
    @Transactional
    public Order placeOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("Pending");

        order.setShippingAddress(request.getShippingAddress());
        order.setShippingMethod(request.getShippingMethod());
        order.setShippingFee(calcShippingFee(request.getShippingMethod()));

        double subtotal = 0.0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found: " + itemRequest.getBookId()));

            if (book.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Không đủ hàng: " + book.getTitle());
            }

            book.setStock(book.getStock() - itemRequest.getQuantity());
            book.setSoldCount((book.getSoldCount() == null ? 0 : book.getSoldCount()) + itemRequest.getQuantity());
            bookRepository.save(book);

            subtotal += book.getPrice() * itemRequest.getQuantity();

            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setBook(book);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setPrice(book.getPrice());
            orderDetails.add(detail);
        }

        order.setSubtotal(subtotal);

        double discountAmount = 0;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().trim().toUpperCase())
                    .orElse(null);

            if (coupon != null && coupon.isActive() && subtotal >= coupon.getMinOrderValue()) {
                if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
                    discountAmount = subtotal * coupon.getDiscountValue() / 100.0;
                    if (coupon.getMaxDiscount() > 0) discountAmount = Math.min(discountAmount, coupon.getMaxDiscount());
                } else {
                    discountAmount = coupon.getDiscountValue();
                }
                discountAmount = Math.min(discountAmount, subtotal);

                coupon.setUsedCount(coupon.getUsedCount() + 1);
                couponRepository.save(coupon);

                order.setCouponCode(coupon.getCode());
            }
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotal + order.getShippingFee() - discountAmount);
        order.setOrderDetails(orderDetails);

        Order savedOrder = orderRepository.save(order);

        emailService.sendOrderConfirmationEmail(user, savedOrder);

        return savedOrder;
    }

    private double calcShippingFee(String method) {
        if (method == null) return 0;
        return switch (method.toUpperCase()) {
            case "EXPRESS"  -> 20000;
            case "SAME_DAY" -> 50000;
            default         -> 0;     // STANDARD = miễn phí
        };
    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return List.of();
    }

    @Override
    public List<OrderHistoryResponse> getMyOrderHistory(String username) {
        List<Order> orders = orderRepository.findByUserUsername(username);
        return orders.stream().map(order -> {
            OrderHistoryResponse response = new OrderHistoryResponse();
            response.setId(order.getId());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());
            response.setStatus(order.getStatus());

            List<OrderItemResponse> items = order.getOrderDetails().stream()
                    .map(detail -> new OrderItemResponse(
                            detail.getBook().getTitle(),
                            detail.getQuantity(),
                            detail.getPrice()
                    )).toList();
            response.setItems(items);
            return response;
        }).toList();
    }

    @Override
    public List<AdminOrderResponse> getAllOrdersForAdmin() {
        return orderRepository.findAll().stream().map(order -> {
            AdminOrderResponse dto = new AdminOrderResponse();
            dto.setId(order.getId());
            dto.setOrderDate(order.getOrderDate());
            dto.setStatus(order.getStatus());
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
        }).toList();
    }

    @Override
    public void updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(newStatus);
        orderRepository.save(order);
    }
}
