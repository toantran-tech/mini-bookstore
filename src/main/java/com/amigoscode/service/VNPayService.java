package com.amigoscode.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    /**
     * Builds a VNPay redirect URL for the given order.
     * @param txnRef  Unique transaction reference (orderId_timestamp)
     * @param orderId Order ID (used in the order info description)
     * @param amount  Order total in VND (BigDecimal — VNPay receives amount × 100 as a long)
     * @param ipAddr  Client IP address
     */
    public String createPaymentUrl(String txnRef, Long orderId, BigDecimal amount, String ipAddr) {
        long vnpAmount = amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact(); // VNPay requires amount × 100 as integer
        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String expireDate = new SimpleDateFormat("yyyyMMddHHmmss")
                .format(new Date(System.currentTimeMillis() + 15 * 60 * 1000)); // 15 phút

        // Các params phải sort theo alphabet (TreeMap tự sort)
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version",    "2.1.0");
        params.put("vnp_Command",    "pay");
        params.put("vnp_TmnCode",    tmnCode);
        params.put("vnp_Amount",     String.valueOf(vnpAmount));
        params.put("vnp_CurrCode",   "VND");
        params.put("vnp_TxnRef",     txnRef);
        params.put("vnp_OrderInfo",  "Thanh toan don hang " + orderId);
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     "vn");
        params.put("vnp_ReturnUrl",  returnUrl);
        params.put("vnp_IpAddr",     ipAddr != null ? ipAddr : "127.0.0.1");
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        // Build hash data và query string
        StringBuilder hashData  = new StringBuilder();
        StringBuilder queryStr  = new StringBuilder();
        boolean first = true;

        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) { hashData.append('&'); queryStr.append('&'); }
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);
            hashData.append(entry.getKey()).append('=').append(encodedValue);
            queryStr.append(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII))
                    .append('=').append(encodedValue);
            first = false;
        }

        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        queryStr.append("&vnp_SecureHash=").append(secureHash);

        return vnpayUrl + "?" + queryStr;
    }

    /**
     * Xác thực chữ ký HMAC từ callback VNPay
     * @return true nếu chữ ký hợp lệ (không bị giả mạo)
     */
    public boolean validateCallback(Map<String, String> params) {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) return false;

        // Bỏ các field chữ ký ra khỏi params rồi tính lại
        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                if (!first) hashData.append('&');
                hashData.append(entry.getKey()).append('=')
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
                first = false;
            }
        }

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        return java.security.MessageDigest.isEqual(
                calculatedHash.getBytes(StandardCharsets.US_ASCII),
                receivedHash.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.US_ASCII));
    }

    // HMAC-SHA512
    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo HMAC", e);
        }
    }
}
