package com.amigoscode.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
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
    private String code;

    private String discountType;

    @Column(precision = 15, scale = 2)
    private BigDecimal discountValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal minOrderValue;

    @Column(precision = 15, scale = 2)
    private BigDecimal maxDiscount;

    private int maxUsage;
    private int usedCount;

    private LocalDateTime expiresAt;

    private boolean active;
}
