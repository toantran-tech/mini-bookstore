package com.amigoscode.service.impl;

import com.amigoscode.Entity.Coupon;
import com.amigoscode.dto.CouponValidateRequest;
import com.amigoscode.dto.CouponValidateResponse;
import com.amigoscode.repository.CouponRepository;
import com.amigoscode.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponValidateResponse validate(CouponValidateRequest request) {
        CouponValidateResponse res = new CouponValidateResponse();

        // 1. Tìm coupon theo code
        Coupon coupon = couponRepository.findByCode(request.getCode().trim().toUpperCase())
                .orElse(null);

        if (coupon == null) {
            return fail(res, request, "Mã giảm giá không tồn tại.");
        }

        // 2. Kiểm tra coupon có đang active không
        if (!coupon.isActive()) {
            return fail(res, request, "Mã giảm giá đã bị vô hiệu hóa.");
        }

        // 3. Kiểm tra hạn sử dụng
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return fail(res, request, "Mã giảm giá đã hết hạn.");
        }

        // 4. Kiểm tra số lần sử dụng
        if (coupon.getMaxUsage() > 0 && coupon.getUsedCount() >= coupon.getMaxUsage()) {
            return fail(res, request, "Mã giảm giá đã hết lượt sử dụng.");
        }

        // 5. Kiểm tra giá trị đơn hàng tối thiểu
        if (request.getOrderSubtotal() < coupon.getMinOrderValue()) {
            return fail(res, request,
                    String.format("Đơn hàng tối thiểu %.0fđ để dùng mã này.", coupon.getMinOrderValue()));
        }

        // 6. Tính số tiền giảm thực tế
        double discount = 0;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = request.getOrderSubtotal() * coupon.getDiscountValue() / 100.0;
            // Giảm tối đa không quá maxDiscount
            if (coupon.getMaxDiscount() > 0) {
                discount = Math.min(discount, coupon.getMaxDiscount());
            }
        } else { // FIXED
            discount = coupon.getDiscountValue();
        }
        // Không được giảm nhiều hơn giá trị đơn
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

    // Helper trả về response lỗi
    private CouponValidateResponse fail(CouponValidateResponse res, CouponValidateRequest req, String msg) {
        res.setValid(false);
        res.setMessage(msg);
        res.setDiscountAmount(0);
        res.setFinalTotal(req.getOrderSubtotal());
        return res;
    }
}
