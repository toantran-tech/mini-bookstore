package com.amigoscode.service.impl;

import com.amigoscode.Entity.Coupon;
import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponValidateResponse validate(CouponValidateRequest request) {
        CouponValidateResponse res = new CouponValidateResponse();
        BigDecimal subtotal = request.getOrderSubtotal();

        Coupon coupon = couponRepository.findByCode(request.getCode().trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return fail(res, subtotal, "Mã giảm giá không tồn tại.");
        }
        if (!coupon.isActive()) {
            return fail(res, subtotal, "Mã giảm giá đã bị vô hiệu hóa.");
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return fail(res, subtotal, "Mã giảm giá đã hết hạn.");
        }
        if (coupon.getMaxUsage() > 0 && coupon.getUsedCount() >= coupon.getMaxUsage()) {
            return fail(res, subtotal, "Mã giảm giá đã hết lượt sử dụng.");
        }
        if (subtotal.compareTo(coupon.getMinOrderValue()) < 0) {
            return fail(res, subtotal,
                    String.format("Đơn hàng tối thiểu %.0fđ để dùng mã này.",
                            coupon.getMinOrderValue().doubleValue()));
        }

        BigDecimal discount;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = subtotal.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (coupon.getMaxDiscount().compareTo(BigDecimal.ZERO) > 0) {
                discount = discount.min(coupon.getMaxDiscount());
            }
        } else {
            discount = coupon.getDiscountValue();
        }
        discount = discount.min(subtotal);

        res.setValid(true);
        res.setMessage("Áp dụng mã giảm giá thành công! 🎉");
        res.setCode(coupon.getCode());
        res.setDiscountType(coupon.getDiscountType());
        res.setDiscountValue(coupon.getDiscountValue());
        res.setDiscountAmount(discount);
        res.setFinalTotal(subtotal.subtract(discount));
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
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy coupon với ID: " + id));
        couponRepository.delete(coupon);
    }

    @Override
    public void updateCoupon(Long id, Coupon updatedCoupon) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy coupon với ID: " + id));
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
    }

    private CouponValidateResponse fail(CouponValidateResponse res, BigDecimal subtotal, String msg) {
        res.setValid(false);
        res.setMessage(msg);
        res.setDiscountAmount(BigDecimal.ZERO);
        res.setFinalTotal(subtotal);
        return res;
    }
}
