package com.amigoscode.controller;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderStatus;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.dto.OrderResponse;
import com.amigoscode.service.NotificationService;
import com.amigoscode.service.OrderService;
import com.amigoscode.service.VNPayService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Pattern TXN_REF_PATTERN = Pattern.compile("^([0-9]+)_[0-9]+$");

    private final OrderService orderService;
    private final VNPayService vnPayService;
    private final NotificationService notificationService;
    private final String frontendPaymentReturnUrl;

    public OrderController(
            OrderService orderService,
            VNPayService vnPayService,
            NotificationService notificationService,
            @Value("${app.frontend.payment-return-url}") String frontendPaymentReturnUrl) {
        this.orderService = orderService;
        this.vnPayService = vnPayService;
        this.notificationService = notificationService;
        this.frontendPaymentReturnUrl = frontendPaymentReturnUrl;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Order newOrder = orderService.placeOrder(username, request);
        return ResponseEntity.ok(new OrderResponse("Đặt hàng thành công!", newOrder.getId()));
    }

    @PostMapping("/checkout-vnpay")
    public ResponseEntity<?> checkoutVNPay(@Valid @RequestBody OrderRequest request, HttpServletRequest httpRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Order order = orderService.placeOrderPending(username, request, "VNPAY");

        String ipAddr = httpRequest.getHeader("X-Forwarded-For");
        if (ipAddr == null || ipAddr.isBlank()) {
            ipAddr = httpRequest.getRemoteAddr();
        } else {
            ipAddr = ipAddr.split(",")[0].trim();
        }

        String paymentUrl = vnPayService.createPaymentUrl(
                order.getVnpayTxnRef(), order.getId(), order.getTotalAmount(), ipAddr);

        return ResponseEntity.ok(Map.of("orderId", order.getId(), "paymentUrl", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<Void> vnpayReturn(@RequestParam Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");

        Matcher matcher = txnRef == null ? null : TXN_REF_PATTERN.matcher(txnRef);
        if (matcher == null || !matcher.matches()) {
            return redirectPaymentResult(false, null, "INVALID_REFERENCE");
        }

        Long orderId = Long.valueOf(matcher.group(1));
        if (!vnPayService.validateCallback(params)) {
            return redirectPaymentResult(false, orderId, "INVALID_SIGNATURE");
        }

        try {
            if ("00".equals(responseCode)) {
                long paidAmount = Long.parseLong(params.getOrDefault("vnp_Amount", ""));
                orderService.confirmPayment(orderId, txnRef, paidAmount);
                return redirectPaymentResult(true, orderId, "00");
            }

            orderService.failPayment(orderId, txnRef);
            String code = responseCode == null || responseCode.isBlank() ? "UNKNOWN" : responseCode;
            return redirectPaymentResult(false, orderId, code);
        } catch (IllegalArgumentException ex) {
            return redirectPaymentResult(false, orderId, "VALIDATION_FAILED");
        }
    }

    private ResponseEntity<Void> redirectPaymentResult(boolean success, Long orderId, String code) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(frontendPaymentReturnUrl)
                .queryParam("success", success)
                .queryParam("code", code);
        if (orderId != null) {
            builder.queryParam("orderId", orderId);
        }
        URI location = builder.build().encode().toUri();
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(location).build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderHistoryResponse>> getMyOrders() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(orderService.getMyOrderHistory(username));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin(page, size));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest) {
        String rawStatus = statusRequest.get("status");
        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(rawStatus);
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(
                    java.util.Map.of("message", "Trạng thái không hợp lệ: " + rawStatus));
        }

        orderService.updateOrderStatus(id, newStatus);

        String ownerUsername = orderService.getOrderOwnerUsername(id);
        if (ownerUsername != null) {
            notificationService.sendToUser(
                    ownerUsername,
                    "Đơn hàng #" + id + " đã cập nhật",
                    "Đơn hàng của bạn đã chuyển sang trạng thái: " + newStatus.name());
        }
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái đơn hàng thành công!"));
    }
}