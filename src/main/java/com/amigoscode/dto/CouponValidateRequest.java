package com.amigoscode.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CouponValidateRequest {
    private String code;
    private BigDecimal orderSubtotal; // Cart subtotal before applying coupon code
}
