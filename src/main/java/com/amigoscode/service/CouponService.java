package com.amigoscode.service;

import com.amigoscode.Entity.Coupon;
import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

public interface CouponService {
    CouponValidateResponse validate(CouponValidateRequest request);
    List<Coupon> getAllCoupons();
    void createCoupon(Coupon coupon);
     void deleteCouponById(Long id);
     void updateCoupon(Long id, Coupon updatedCoupon);
}
