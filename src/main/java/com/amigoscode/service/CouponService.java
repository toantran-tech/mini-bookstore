package com.amigoscode.service;

import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;

public interface CouponService {
    CouponValidateResponse validate(CouponValidateRequest request);
}
