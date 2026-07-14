package com.amigoscode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private String message;         // "Áp dụng thành công!" or reason for failure
    private String code;
    private String discountType;    // "PERCENT" | "FIXED"
    private BigDecimal discountValue;   // Configured discount value
    private BigDecimal discountAmount;  // Actual money saved (computed against subtotal)
    private BigDecimal finalTotal;      // Total after applying discount
}
