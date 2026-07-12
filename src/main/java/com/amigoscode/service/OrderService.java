package com.amigoscode.service;

import com.amigoscode.Entity.Order;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderRequest;

import java.util.List;

public interface OrderService  {
    Order placeOrder(String username, OrderRequest order);
    Order placeOrderPending(String username, OrderRequest order, String paymentMethod);
    List<Order> findByUserId(Long userId);
    List<OrderHistoryResponse> getMyOrderHistory(String username);
    List<AdminOrderResponse> getAllOrdersForAdmin();
    void updateOrderStatus(Long orderId, String newStatus);
    boolean confirmPayment(Long orderId, String txnRef, long paidAmount);
    void failPayment(Long orderId, String txnRef);
    String getOrderOwnerUsername(Long orderId);
}
