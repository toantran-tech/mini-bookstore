package com.amigoscode.service;

import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.User;

public interface EmailService {
    void sendOtpEmail(String toEmail, String otp);

    void sendOrderConfirmationEmail(User user, Order order);
}
