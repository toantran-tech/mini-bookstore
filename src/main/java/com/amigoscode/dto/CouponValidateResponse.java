package com.amigoscode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidateResponse {
    private boolean valid;
    private String message;         // "Áp dụng thành công!" hoặc lý do thất bại
    private String code;
    private String discountType;    // "PERCENT" | "FIXED"
    private double discountValue;   // Giá trị giảm
    private double discountAmount;  // Số tiền thực tế được giảm (đã tính theo subtotal)
    private double finalTotal;      // Tổng sau khi giảm
}
