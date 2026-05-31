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
    private String code; 

    private String discountType; 
    private double discountValue; 

    private double minOrderValue; 
    private double maxDiscount; 

    private int maxUsage; 
    private int usedCount; 

    private LocalDateTime expiresAt; 

    private boolean active; 
}
