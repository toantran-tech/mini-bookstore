package com.amigoscode.service;

import com.amigoscode.Entity.Order;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderRequest;

import java.util.List;

public interface OrderService  {
    Order placeOrder(String username, OrderRequest order);
    List<Order> findByUserId(Long userId);
    List<OrderHistoryResponse> getMyOrderHistory(String username);
    List<AdminOrderResponse> getAllOrdersForAdmin();
    void updateOrderStatus(Long orderId, String newStatus);
}
