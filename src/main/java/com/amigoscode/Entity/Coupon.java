package com.amigoscode.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "coupons")
public class Coupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // Mã giảm giá (VD: "SALE20", "FREESHIP")

    private String discountType; // "PERCENT" hoặc "FIXED"
    private double discountValue; // 20 (tức 20%) hoặc 50000 (tức -50k)

    private double minOrderValue; // Đơn tối thiểu để áp mã (VD: 100000đ)
    private double maxDiscount; // Giảm tối đa (VD: PERCENT 50% nhưng max 100k)

    private int maxUsage; // Số lần dùng tối đa
    private int usedCount; // Đã dùng bao nhiêu lần

    private LocalDateTime expiresAt; // Hạn sử dụng

    private boolean active; // Admin bật/tắt mã này
}
