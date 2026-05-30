package com.amigoscode.dto;

import lombok.Data;

@Data
public class CouponValidateRequest {
    private String code;
    private double orderSubtotal; // Tiền hàng trước khi áp mã
}
