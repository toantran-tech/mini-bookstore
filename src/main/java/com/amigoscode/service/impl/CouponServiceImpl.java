package com.amigoscode.service.impl;

import com.amigoscode.Entity.Coupon;
import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponValidateResponse validate(CouponValidateRequest request) {
        CouponValidateResponse res = new CouponValidateResponse();

        Coupon coupon = couponRepository.findByCode(request.getCode().trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return fail(res, request, "Mã giảm giá không tồn tại.");
        }

        if (!coupon.isActive()) {
            return fail(res, request, "Mã giảm giá đã bị vô hiệu hóa.");
        }

        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return fail(res, request, "Mã giảm giá đã hết hạn.");
        }

        if (coupon.getMaxUsage() > 0 && coupon.getUsedCount() >= coupon.getMaxUsage()) {
            return fail(res, request, "Mã giảm giá đã hết lượt sử dụng.");
        }

        if (request.getOrderSubtotal() < coupon.getMinOrderValue()) {
            return fail(res, request,
                    String.format("Đơn hàng tối thiểu %.0fđ để dùng mã này.", coupon.getMinOrderValue()));
        }

        double discount = 0;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = request.getOrderSubtotal() * coupon.getDiscountValue() / 100.0;
            if (coupon.getMaxDiscount() > 0) {
                discount = Math.min(discount, coupon.getMaxDiscount());
            }
        } else { // FIXED
            discount = coupon.getDiscountValue();
        }
        discount = Math.min(discount, request.getOrderSubtotal());

        res.setValid(true);
        res.setMessage("Áp dụng mã giảm giá thành công! 🎉");
        res.setCode(coupon.getCode());
        res.setDiscountType(coupon.getDiscountType());
        res.setDiscountValue(coupon.getDiscountValue());
        res.setDiscountAmount(discount);
        res.setFinalTotal(request.getOrderSubtotal() - discount);
        return res;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public void createCoupon(Coupon coupon) {
        couponRepository.save(coupon);
    }

    @Override
    public void deleteCouponById(Long id) {
        Coupon coupon = couponRepository.findById(id).orElse(null);
        if (coupon != null) {
            couponRepository.delete(coupon);
        } else {
            throw new IllegalArgumentException("Không tìm thấy coupon với ID: " + id);
        }
    }

    @Override
    public void updateCoupon(Long id, Coupon updatedCoupon) {
        Coupon coupon = couponRepository.findById(id).orElse(null);
        if (coupon != null) {
            coupon.setCode(updatedCoupon.getCode());
            coupon.setDiscountType(updatedCoupon.getDiscountType());
            coupon.setDiscountValue(updatedCoupon.getDiscountValue());
            coupon.setMaxDiscount(updatedCoupon.getMaxDiscount());
            coupon.setMinOrderValue(updatedCoupon.getMinOrderValue());
            coupon.setMaxUsage(updatedCoupon.getMaxUsage());
            coupon.setUsedCount(updatedCoupon.getUsedCount());
            coupon.setActive(updatedCoupon.isActive());
            coupon.setExpiresAt(updatedCoupon.getExpiresAt());

            couponRepository.save(coupon);
        } else {
            throw new IllegalArgumentException("Không tìm thấy coupon với ID: " + id);
        }
    }

    private CouponValidateResponse fail(CouponValidateResponse res, CouponValidateRequest req, String msg) {
        res.setValid(false);
        res.setMessage(msg);
        res.setDiscountAmount(0);
        res.setFinalTotal(req.getOrderSubtotal());
        return res;
    }
}
