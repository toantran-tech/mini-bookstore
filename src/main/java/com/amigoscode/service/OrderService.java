package com.amigoscode.service;

import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderStatus;
import com.amigoscode.dto.AdminOrderResponse;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface OrderService {
    Order placeOrder(String username, OrderRequest order);
    Order placeOrderPending(String username, OrderRequest order, String paymentMethod);
    List<OrderHistoryResponse> getMyOrderHistory(String username);
    /** Paginated order list for admin (avoids loading all rows at once). */
    Page<AdminOrderResponse> getAllOrdersForAdmin(int page, int size);
    void updateOrderStatus(Long orderId, OrderStatus newStatus);
    boolean confirmPayment(Long orderId, String txnRef, long paidAmount);
    void failPayment(Long orderId, String txnRef);
    String getOrderOwnerUsername(Long orderId);
}
