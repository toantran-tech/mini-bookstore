package com.amigoscode.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    private List<OrderItemRequest> items;

    // Shipping info
    private String shippingAddress;     // "123 Nguyễn Huệ, Q1, TP.HCM"
    private String shippingMethod;      // "STANDARD" | "EXPRESS" | "SAME_DAY"

    // Coupon
    private String couponCode;          // Mã giảm giá (null nếu không dùng)
}
