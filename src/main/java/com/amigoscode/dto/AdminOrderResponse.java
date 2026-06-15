package com.amigoscode.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminOrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private String status;
    private String username;
    private String email;
    private String shippingAddress;
    private String shippingMethod;
    private String couponCode;
    private double subtotal;
    private double discountAmount;
    private double shippingFee;
    private double totalAmount;
    private List<OrderItemResponse> items;
}
