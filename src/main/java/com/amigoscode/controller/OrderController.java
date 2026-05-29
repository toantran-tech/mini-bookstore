package com.amigoscode.controller;

import com.amigoscode.Entity.Order;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderResponse;
import com.amigoscode.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String username = authentication.getName();

        Order newOrder = orderService.placeOrder(username, request);

        OrderResponse response = new OrderResponse("Đặt hàng thành công!", newOrder.getId());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderHistoryResponse>> getMyOrders() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return ResponseEntity.ok(orderService.getMyOrderHistory(username));
    }
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrdersForAdmin());
    }
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusRequest) {

        String newStatus = statusRequest.get("status");

        orderService.updateOrderStatus(id, newStatus);

        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái đơn hàng thành công!"));
    }
}
