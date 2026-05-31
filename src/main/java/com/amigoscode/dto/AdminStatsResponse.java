package com.amigoscode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    // Tổng quan
    private long totalOrders;
    private double totalRevenue;
    private long totalBooks;
    private long totalUsers;

    // Đơn theo trạng thái: { "Pending": 5, "Delivered": 10, ... }
    private Map<String, Long> ordersByStatus;

    // Doanh thu theo tháng (12 tháng gần nhất): [{ "month": "2025-01", "revenue": 150000 }, ...]
    private List<Map<String, Object>> revenueByMonth;

    // Top 5 sách bán chạy: [{ "title": "...", "sold": 50 }, ...]
    private List<Map<String, Object>> topBooks;
}
