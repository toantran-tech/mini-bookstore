package com.amigoscode.dto;

import lombok.Data;
import java.math.BigDecimal;
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
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private List<OrderItemResponse> items;
}
