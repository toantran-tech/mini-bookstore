package com.amigoscode.controller;

import com.amigoscode.dto.AdminStatsResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {

        // 1. Số liệu tổng quan
        long totalOrders = orderRepository.count();
        double totalRevenue = orderRepository.getTotalRevenue();
        long totalBooks = bookRepository.count();
        long totalUsers = userRepository.count();

        // 2. Đơn hàng theo trạng thái
        Map<String, Long> ordersByStatus = new HashMap<>();
        List<Object[]> statusRows = orderRepository.countByStatus();
        for (Object[] row : statusRows) {
            String status = row[0] != null ? row[0].toString() : "Unknown";
            Long count = ((Number) row[1]).longValue();
            ordersByStatus.put(status, count);
        }

        // 3. Doanh thu theo tháng (12 tháng gần nhất)
        List<Map<String, Object>> revenueByMonth = new ArrayList<>();
        List<Object[]> monthRows = orderRepository.getRevenueByMonth();
        for (Object[] row : monthRows) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", row[0].toString());
            entry.put("revenue", ((Number) row[1]).doubleValue());
            revenueByMonth.add(entry);
        }

        // 4. Top 5 sách bán chạy nhất
        List<Map<String, Object>> topBooks = new ArrayList<>();
        bookRepository.findTop10ByOrderBySoldCountDesc()
                .stream().limit(5).forEach(book -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("title", book.getTitle());
                    entry.put("sold", book.getSoldCount());
                    entry.put("revenue", book.getSoldCount() * book.getPrice());
                    entry.put("imageUrl", book.getImageUrl());
                    topBooks.add(entry);
                });

        AdminStatsResponse stats = new AdminStatsResponse(
                totalOrders,
                totalRevenue,
                totalBooks,
                totalUsers,
                ordersByStatus,
                revenueByMonth,
                topBooks
        );

        return ResponseEntity.ok(stats);
    }
}
