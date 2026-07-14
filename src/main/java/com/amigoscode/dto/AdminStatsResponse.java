package com.amigoscode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalOrders;
    private BigDecimal totalRevenue;
    private long totalBooks;
    private long totalUsers;

    private Map<String, Long> ordersByStatus;

    private List<Map<String, Object>> revenueByMonth;

    private List<Map<String, Object>> topBooks;
}
