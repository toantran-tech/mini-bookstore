package com.amigoscode.service;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderDetail;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderItemRequest;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private BookRepository bookRepository;
    @Mock private UserRepository userRepository;
    @Mock private CouponRepository couponRepository;
    @Mock private EmailService emailService;

    @InjectMocks private OrderServiceImpl orderService;

    private User user;
    private Book book;
    private Order order;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setEmail("test@example.com");

        book = new Book();
        book.setId(1L);
        book.setTitle("Clean Code");
        book.setPrice(50000.0);
        book.setStock(10);
        book.setSoldCount(5);

        OrderDetail detail = new OrderDetail();
        detail.setBook(book);
        detail.setQuantity(2);
        detail.setPrice(50000.0);

        order = new Order();
        order.setId(1L);
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("Pending");
        order.setSubtotal(100000.0);
        order.setTotalAmount(100000.0);
        order.setOrderDetails(List.of(detail));
    }

    // ─── placeOrder ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("placeOrder: thành công với dữ liệu hợp lệ")
    void placeOrder_shouldSucceed_whenDataIsValid() {
        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setBookId(1L);
        itemReq.setQuantity(2);

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(itemReq));
        request.setShippingAddress("123 Test St");
        request.setShippingMethod("STANDARD");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(orderRepository.save(any(Order.class))).thenReturn(order);
        doNothing().when(emailService).sendOrderConfirmationEmail(any(), any());

        Order result = orderService.placeOrder("testuser", request);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        // Stock phải được trừ đúng
        assertThat(book.getStock()).isEqualTo(8);
        // SoldCount phải được tăng đúng
        assertThat(book.getSoldCount()).isEqualTo(7);
        verify(orderRepository).save(any(Order.class));
    }

    @Test
    @DisplayName("placeOrder: ném exception khi user không tồn tại")
    void placeOrder_shouldThrow_whenUserNotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        OrderRequest request = new OrderRequest();
        request.setItems(List.of());
        request.setShippingAddress("x");
        request.setShippingMethod("STANDARD");

        assertThatThrownBy(() -> orderService.placeOrder("ghost", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    @DisplayName("placeOrder: ném exception khi hết hàng")
    void placeOrder_shouldThrow_whenOutOfStock() {
        book.setStock(1); // chỉ còn 1 cuốn nhưng đặt 5

        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setBookId(1L);
        itemReq.setQuantity(5);

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(itemReq));
        request.setShippingAddress("123 Test St");
        request.setShippingMethod("STANDARD");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> orderService.placeOrder("testuser", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Không đủ hàng");
    }

    @Test
    @DisplayName("placeOrder: phí ship EXPRESS = 20000")
    void placeOrder_shouldApplyExpressShippingFee() {
        OrderItemRequest itemReq = new OrderItemRequest();
        itemReq.setBookId(1L);
        itemReq.setQuantity(1);

        OrderRequest request = new OrderRequest();
        request.setItems(List.of(itemReq));
        request.setShippingAddress("123 Test St");
        request.setShippingMethod("EXPRESS");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
        doNothing().when(emailService).sendOrderConfirmationEmail(any(), any());

        Order result = orderService.placeOrder("testuser", request);

        assertThat(result.getShippingFee()).isEqualTo(20000.0);
    }

    // ─── getMyOrderHistory ────────────────────────────────────────────────────

    @Test
    @DisplayName("getMyOrderHistory: trả về danh sách đơn hàng của user")
    void getMyOrderHistory_shouldReturnOrderList() {
        when(orderRepository.findByUserUsername("testuser")).thenReturn(List.of(order));

        List<OrderHistoryResponse> result = orderService.getMyOrderHistory("testuser");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(0).getStatus()).isEqualTo("Pending");
        assertThat(result.get(0).getItems()).hasSize(1);
        assertThat(result.get(0).getItems().get(0).getBookTitle()).isEqualTo("Clean Code");
    }

    @Test
    @DisplayName("getMyOrderHistory: trả về list rỗng khi user chưa đặt hàng")
    void getMyOrderHistory_shouldReturnEmpty_whenNoOrders() {
        when(orderRepository.findByUserUsername("testuser")).thenReturn(List.of());

        List<OrderHistoryResponse> result = orderService.getMyOrderHistory("testuser");

        assertThat(result).isEmpty();
    }

    // ─── getAllOrdersForAdmin ──────────────────────────────────────────────────

    @Test
    @DisplayName("getAllOrdersForAdmin: trả về DTO không có circular reference")
    void getAllOrdersForAdmin_shouldReturnAdminOrderResponseList() {
        when(orderRepository.findAll()).thenReturn(List.of(order));

        List<AdminOrderResponse> result = orderService.getAllOrdersForAdmin();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUsername()).isEqualTo("testuser");
        assertThat(result.get(0).getEmail()).isEqualTo("test@example.com");
        assertThat(result.get(0).getItems()).hasSize(1);
    }

    // ─── updateOrderStatus ────────────────────────────────────────────────────

    @Test
    @DisplayName("updateOrderStatus: cập nhật status thành công")
    void updateOrderStatus_shouldUpdateSuccessfully() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        orderService.updateOrderStatus(1L, "Delivered");

        assertThat(order.getStatus()).isEqualTo("Delivered");
        verify(orderRepository).save(order);
    }

    @Test
    @DisplayName("updateOrderStatus: ném exception khi không tìm thấy order")
    void updateOrderStatus_shouldThrow_whenOrderNotFound() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.updateOrderStatus(99L, "Delivered"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Order not found");
    }

    // ─── VNPay callback hardening ─────────────────────────────────────────────

    @Test
    @DisplayName("confirmPayment: cập nhật tồn kho đúng một lần khi callback hợp lệ")
    void confirmPayment_shouldProcessValidCallbackOnce() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PENDING");
        order.setVnpayTxnRef("1_123456");

        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));
        when(bookRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(book));

        boolean processed = orderService.confirmPayment(1L, "1_123456", 10_000_000L);

        assertThat(processed).isTrue();
        assertThat(order.getPaymentStatus()).isEqualTo("PAID");
        assertThat(order.getStatus()).isEqualTo("Processing");
        assertThat(book.getStock()).isEqualTo(8);
        assertThat(book.getSoldCount()).isEqualTo(7);
        verify(emailService).sendOrderConfirmationEmail(user, order);
    }

    @Test
    @DisplayName("confirmPayment: callback lặp không trừ tồn kho lần hai")
    void confirmPayment_shouldBeIdempotent_whenAlreadyPaid() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PAID");
        order.setVnpayTxnRef("1_123456");

        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));

        boolean processed = orderService.confirmPayment(1L, "1_123456", 10_000_000L);

        assertThat(processed).isFalse();
        assertThat(book.getStock()).isEqualTo(10);
        verifyNoInteractions(emailService);
        verify(bookRepository, never()).findByIdForUpdate(anyLong());
    }

    @Test
    @DisplayName("confirmPayment: từ chối số tiền không khớp")
    void confirmPayment_shouldRejectWrongAmount() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PENDING");
        order.setVnpayTxnRef("1_123456");
        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.confirmPayment(1L, "1_123456", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("amount");

        verify(bookRepository, never()).findByIdForUpdate(anyLong());
        assertThat(order.getPaymentStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("confirmPayment: từ chối transaction reference không khớp")
    void confirmPayment_shouldRejectWrongTransactionReference() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PENDING");
        order.setVnpayTxnRef("1_123456");
        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.confirmPayment(1L, "1_forged", 10_000_000L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reference");

        verifyNoInteractions(bookRepository);
    }

    @Test
    @DisplayName("confirmPayment: không trừ âm tồn kho khi hàng đã hết")
    void confirmPayment_shouldRejectWhenStockChangedBeforeCallback() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PENDING");
        order.setVnpayTxnRef("1_123456");
        book.setStock(1);

        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));
        when(bookRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> orderService.confirmPayment(1L, "1_123456", 10_000_000L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Không đủ hàng");

        assertThat(book.getStock()).isEqualTo(1);
        assertThat(order.getPaymentStatus()).isEqualTo("PENDING");
        verify(bookRepository, never()).save(any());
    }

    @Test
    @DisplayName("failPayment: callback thất bại không được ghi đè đơn đã thanh toán")
    void failPayment_shouldNotOverwritePaidOrder() {
        order.setPaymentMethod("VNPAY");
        order.setPaymentStatus("PAID");
        order.setStatus("Processing");
        order.setVnpayTxnRef("1_123456");
        when(orderRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(order));

        orderService.failPayment(1L, "1_123456");

        assertThat(order.getPaymentStatus()).isEqualTo("PAID");
        assertThat(order.getStatus()).isEqualTo("Processing");
        verify(orderRepository, never()).save(any());
    }
}