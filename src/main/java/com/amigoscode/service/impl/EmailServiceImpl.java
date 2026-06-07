package com.amigoscode.service.impl;

import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderDetail;
import com.amigoscode.Entity.User;
import com.amigoscode.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("📚 Mini Bookstore - Mã xác thực OTP của bạn");
            helper.setFrom("Mini Bookstore <tranquoctoan232003@gmail.com>");

            String html = """
                    <!DOCTYPE html>
                    <html lang="vi">
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
                        <tr><td align="center">
                          <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <!-- Header -->
                            <tr>
                              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;">
                                <h1 style="margin:0;color:#fff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">📚 Mini Bookstore</h1>
                                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Xác thực tài khoản của bạn</p>
                              </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                              <td style="padding:40px;">
                                <p style="margin:0 0 8px;color:#374151;font-size:16px;">Xin chào,</p>
                                <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                                  Mã OTP của bạn để hoàn tất đăng ký tài khoản tại <strong>Mini Bookstore</strong>:
                                </p>
                                <!-- OTP Box -->
                                <div style="background:linear-gradient(135deg,#eef2ff,#f5f3ff);border:2px dashed #818cf8;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                                  <p style="margin:0 0 4px;color:#6366f1;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Mã xác thực của bạn</p>
                                  <span style="font-size:48px;font-weight:900;color:#4f46e5;letter-spacing:12px;">%s</span>
                                </div>
                                <!-- Warning -->
                                <table width="100%%" style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;margin-bottom:24px;">
                                  <tr><td style="padding:14px 18px;">
                                    <p style="margin:0;color:#c2410c;font-size:13px;">⏱️ <strong>Mã có hiệu lực trong 5 phút.</strong> Không chia sẻ mã này với bất kỳ ai!</p>
                                  </td></tr>
                                </table>
                                <p style="margin:0;color:#9ca3af;font-size:13px;">Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.</p>
                              </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                              <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                                <p style="margin:0;color:#d1d5db;font-size:12px;">© 2025 Mini Bookstore · Hệ thống bán sách trực tuyến</p>
                              </td>
                            </tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(otp);

            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            throw new RuntimeException("Không thể gửi email OTP: " + e.getMessage(), e);
        }
    }

    @Async
    @Override
    public void sendOrderConfirmationEmail(User user, Order order) {
        if (user.getEmail() == null || user.getEmail().isBlank()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("✅ Mini Bookstore - Xác nhận đơn hàng #" + order.getId());
            helper.setFrom("Mini Bookstore <tranquoctoan232003@gmail.com>");

            StringBuilder itemRows = new StringBuilder();
            for (OrderDetail detail : order.getOrderDetails()) {
                String title = detail.getBook().getTitle();
                int qty = detail.getQuantity();
                double price = detail.getPrice();
                itemRows.append("""
                        <tr>
                          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;color:#374151;font-size:14px;">%s</td>
                          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;text-align:center;">x%d</td>
                          <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;color:#4f46e5;font-weight:700;font-size:14px;text-align:right;">%,.0fđ</td>
                        </tr>
                        """.formatted(title, qty, price * qty));
            }

            String displayName = (user.getFullName() != null && !user.getFullName().isBlank())
                    ? user.getFullName() : user.getUsername();
            String orderDate = order.getOrderDate()
                    .format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
            String discountRow = order.getDiscountAmount() > 0
                    ? """
                    <tr>
                      <td colspan="2" style="padding:6px 0;color:#059669;font-size:14px;">🎟️ Giảm giá (%s)</td>
                      <td style="padding:6px 0;color:#059669;font-weight:700;font-size:14px;text-align:right;">-%,.0fđ</td>
                    </tr>
                    """.formatted(order.getCouponCode(), order.getDiscountAmount()) : "";

            String html = """
                    <!DOCTYPE html>
                    <html lang="vi">
                    <head><meta charset="UTF-8"></head>
                    <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
                      <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
                        <tr><td align="center">
                          <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <!-- Header -->
                            <tr>
                              <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;">
                                <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">📚 Mini Bookstore</h1>
                                <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Xác nhận đơn hàng thành công</p>
                              </td>
                            </tr>
                            <!-- Body -->
                            <tr><td style="padding:40px;">
                              <p style="margin:0 0 6px;color:#374151;font-size:16px;">Chào <strong>%s</strong>! 🎉</p>
                              <p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">
                                Cảm ơn bạn đã đặt hàng tại Mini Bookstore. Đơn hàng của bạn đã được tiếp nhận thành công!
                              </p>

                              <!-- Order Info -->
                              <table width="100%%" style="background:#f9fafb;border-radius:10px;margin-bottom:24px;">
                                <tr>
                                  <td style="padding:18px 20px;">
                                    <table width="100%%">
                                      <tr>
                                        <td style="color:#6b7280;font-size:13px;">Mã đơn hàng</td>
                                        <td style="color:#4f46e5;font-weight:800;font-size:18px;text-align:right;">#%d</td>
                                      </tr>
                                      <tr>
                                        <td style="color:#6b7280;font-size:13px;padding-top:8px;">Thời gian đặt</td>
                                        <td style="color:#374151;font-size:13px;text-align:right;padding-top:8px;">%s</td>
                                      </tr>
                                      <tr>
                                        <td style="color:#6b7280;font-size:13px;padding-top:8px;">Địa chỉ giao hàng</td>
                                        <td style="color:#374151;font-size:13px;text-align:right;padding-top:8px;">%s</td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>

                              <!-- Items -->
                              <h3 style="margin:0 0 12px;color:#1f2937;font-size:15px;font-weight:700;">📦 Sản phẩm đặt mua</h3>
                              <table width="100%%">
                                %s
                                <tr>
                                  <td colspan="2" style="padding:8px 0;color:#6b7280;font-size:14px;">Phí vận chuyển</td>
                                  <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;">%s</td>
                                </tr>
                                %s
                                <tr>
                                  <td colspan="2" style="padding:14px 0 0;color:#1f2937;font-weight:800;font-size:16px;border-top:2px solid #e5e7eb;">TỔNG THANH TOÁN</td>
                                  <td style="padding:14px 0 0;color:#4f46e5;font-weight:900;font-size:20px;text-align:right;border-top:2px solid #e5e7eb;">%,.0fđ</td>
                                </tr>
                              </table>
                            </td></tr>
                            <!-- Footer -->
                            <tr>
                              <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #f3f4f6;">
                                <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Chúng tôi sẽ thông báo khi đơn hàng được giao.</p>
                                <p style="margin:0;color:#d1d5db;font-size:12px;">© 2025 Mini Bookstore</p>
                              </td>
                            </tr>
                          </table>
                        </td></tr>
                      </table>
                    </body>
                    </html>
                    """.formatted(
                    displayName,
                    order.getId(),
                    orderDate,
                    order.getShippingAddress(),
                    itemRows.toString(),
                    order.getShippingFee() == 0 ? "Miễn phí" : String.format(Locale.US, "%,.0fđ", order.getShippingFee()),
                    discountRow,
                    order.getTotalAmount()
            );

            helper.setText(html, true);
            mailSender.send(message);

        } catch (MessagingException e) {
            System.err.println("Gửi email xác nhận đơn hàng thất bại: " + e.getMessage());
        }
    }
}
