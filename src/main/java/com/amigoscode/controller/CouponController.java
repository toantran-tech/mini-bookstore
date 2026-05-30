package com.amigoscode.controller;

import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;
import com.amigoscode.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    // POST /api/coupons/validate — Kiểm tra mã giảm giá
    @PostMapping("/validate")
    public ResponseEntity<CouponValidateResponse> validate(@RequestBody CouponValidateRequest request) {
        return ResponseEntity.ok(couponService.validate(request));
    }
}
