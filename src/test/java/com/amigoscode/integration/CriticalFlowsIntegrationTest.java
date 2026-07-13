package com.amigoscode.integration;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Category;
import com.amigoscode.Entity.Coupon;
import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.OrderItemRequest;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.CategoryRepository;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.EmailService;
import com.amigoscode.service.OrderService;
import com.amigoscode.service.OtpStore;
import com.amigoscode.service.VNPayService;
import com.amigoscode.support.MySqlContainerTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CriticalFlowsIntegrationTest extends MySqlContainerTest {
    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired CategoryRepository categoryRepository;
    @Autowired BookRepository bookRepository;
    @Autowired CouponRepository couponRepository;
    @Autowired OrderRepository orderRepository;
    @Autowired OrderService orderService;
    @Autowired OtpStore otpStore;

    @MockitoBean EmailService emailService;
    @MockitoBean VNPayService vnPayService;

    @Test
    void registerAndLogin_createsOnlyUserRoleAndReturnsTokens() throws Exception {
        otpStore.save("intern@example.com", "123456");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"intern_user","email":"intern@example.com", "password":"secret123","otp":"123456"}
                                """))
                .andExpect(status().isOk());

        User registered = userRepository.findByUsername("intern_user").orElseThrow();
        assertThat(registered.getRole()).isEqualTo("ROLE_USER");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"username":"intern_user","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    void adminEndpoint_enforcesUserAndAdminRoles() throws Exception {
        mockMvc.perform(get("/api/admin/users").with(user("normal").roles("USER")))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/admin/users").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void placeOrder_appliesCouponAndUpdatesStock() throws Exception {
        User buyer = saveUser("cash_buyer");
        Book book = saveBook(10, 100_000);
        Coupon coupon = saveCoupon("SAVE10");

        mockMvc.perform(post("/api/orders")
                        .with(user(buyer.getUsername()).roles("USER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(orderJson(book.getId(), coupon.getCode())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").isNumber());

        assertThat(bookRepository.findById(book.getId()).orElseThrow().getStock()).isEqualTo(8);
        assertThat(couponRepository.findById(coupon.getId()).orElseThrow().getUsedCount()).isEqualTo(1);
        assertThat(orderRepository.findAll()).singleElement().satisfies(order -> {
            assertThat(order.getDiscountAmount()).isEqualTo(20_000);
            assertThat(order.getTotalAmount()).isEqualTo(180_000);
        });
    }

    @Test
    void vnpayCallback_validAndRepeated_updatesStockAndCouponExactlyOnce() throws Exception {
        User buyer = saveUser("vnpay_buyer");
        Book book = saveBook(10, 100_000);
        Coupon coupon = saveCoupon("PAY10");
        Order pending = orderService.placeOrderPending(
                buyer.getUsername(), orderRequest(book.getId(), coupon.getCode()), "VNPAY");
        when(vnPayService.validateCallback(anyMap())).thenReturn(true);

        String callback = "/api/orders/vnpay-return?vnp_TxnRef=" + pending.getVnpayTxnRef()
                + "&vnp_ResponseCode=00&vnp_Amount=" + Math.round(pending.getTotalAmount() * 100);

        mockMvc.perform(get(callback))
                .andExpect(status().isSeeOther())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("success=true")));
        mockMvc.perform(get(callback)).andExpect(status().isSeeOther());

        assertThat(orderRepository.findById(pending.getId()).orElseThrow().getPaymentStatus()).isEqualTo("PAID");
        assertThat(bookRepository.findById(book.getId()).orElseThrow().getStock()).isEqualTo(8);
        assertThat(couponRepository.findById(coupon.getId()).orElseThrow().getUsedCount()).isEqualTo(1);
    }

    @Test
    void vnpayCallback_invalidSignature_keepsOrderAndInventoryUntouched() throws Exception {
        User buyer = saveUser("invalid_signature_buyer");
        Book book = saveBook(10, 100_000);
        Order pending = orderService.placeOrderPending(
                buyer.getUsername(), orderRequest(book.getId(), null), "VNPAY");
        when(vnPayService.validateCallback(anyMap())).thenReturn(false);

        mockMvc.perform(get("/api/orders/vnpay-return")
                        .param("vnp_TxnRef", pending.getVnpayTxnRef())
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_Amount", String.valueOf(Math.round(pending.getTotalAmount() * 100))))
                .andExpect(status().isSeeOther())
                .andExpect(header().string("Location", org.hamcrest.Matchers.containsString("INVALID_SIGNATURE")));

        assertThat(orderRepository.findById(pending.getId()).orElseThrow().getPaymentStatus()).isEqualTo("PENDING");
        assertThat(bookRepository.findById(book.getId()).orElseThrow().getStock()).isEqualTo(10);
    }

    @Test
    void validationError_hasStableApiErrorShape() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.path").value("/api/auth/login"));
    }

    private User saveUser(String username) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(username + "@example.com");
        user.setPassword("unused-in-security-mock");
        user.setRole("ROLE_USER");
        return userRepository.save(user);
    }

    private Book saveBook(int stock, double price) {
        Category category = new Category();
        category.setName("Integration " + System.nanoTime());
        category = categoryRepository.save(category);
        Book book = new Book();
        book.setTitle("Test Book");
        book.setAuthor("Test Author");
        book.setIsbn("ISBN-" + System.nanoTime());
        book.setPrice(price);
        book.setCategory(category);
        book.setStock(stock);
        book.setSoldCount(0);
        book.setViewCount(0);
        return bookRepository.save(book);
    }

    private Coupon saveCoupon(String code) {
        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setDiscountType("PERCENT");
        coupon.setDiscountValue(10);
        coupon.setMinOrderValue(0);
        coupon.setMaxDiscount(50_000);
        coupon.setMaxUsage(10);
        coupon.setUsedCount(0);
        coupon.setExpiresAt(LocalDateTime.now().plusDays(1));
        coupon.setActive(true);
        return couponRepository.save(coupon);
    }

    private OrderRequest orderRequest(Long bookId, String couponCode) {
        return new OrderRequest(List.of(new OrderItemRequest(bookId, 2)), "Test address", "STANDARD", couponCode);
    }

    private String orderJson(Long bookId, String couponCode) {
        String coupon = couponCode == null ? "null" : "\"" + couponCode + "\"";
        return "{\"items\":[{\"bookId\":" + bookId + ",\"quantity\":2}],"
                + "\"shippingAddress\":\"Test address\",\"shippingMethod\":\"STANDARD\","
                + "\"couponCode\":" + coupon + "}";
    }
}