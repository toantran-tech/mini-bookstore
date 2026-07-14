package com.amigoscode.controller;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.OrderStatus;
import com.amigoscode.exception.ApiException;
import com.amigoscode.dto.AdminStatsResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {

        long totalOrders = orderRepository.count();
        java.math.BigDecimal totalRevenue = orderRepository.getTotalRevenue(OrderStatus.Delivered);
        long totalBooks = bookRepository.count();
        long totalUsers = userRepository.count();

        Map<String, Long> ordersByStatus = new HashMap<>();
        List<Object[]> statusRows = orderRepository.countByStatus();
        for (Object[] row : statusRows) {
            String status = row[0] != null ? row[0].toString() : "Unknown";
            Long count = ((Number) row[1]).longValue();
            ordersByStatus.put(status, count);
        }

        List<Map<String, Object>> revenueByMonth = new ArrayList<>();
        List<Object[]> monthRows = orderRepository.findMonthlyRevenue(OrderStatus.Delivered);

        for (Object[] row : monthRows) {
            Map<String, Object> entry = new HashMap<>();
            int year = ((Number) row[0]).intValue();
            int month = ((Number) row[1]).intValue();
            java.math.BigDecimal revenue = (java.math.BigDecimal) row[2];

            String monthKey = String.format("%d-%02d", year, month);
            entry.put("month", monthKey);
            entry.put("revenue", revenue);
            revenueByMonth.add(entry);
        }

        List<Map<String, Object>> topBooks = new ArrayList<>();
        bookRepository.findTop10ByOrderBySoldCountDesc()
                .stream().limit(5).forEach(book -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("title", book.getTitle());
                    entry.put("sold", book.getSoldCount());
                    entry.put("revenue",
                            java.math.BigDecimal.valueOf(book.getSoldCount()).multiply(book.getPrice()));
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
                topBooks);

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/books/{id}/upload-image")
    public ResponseEntity<?> uploadBookImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Book book = bookRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Book not found"));

            String imageUrl = cloudinaryService.uploadImage(file);
            book.setImageUrl(imageUrl);
            bookRepository.save(book);

            return ResponseEntity.ok(Map.of(
                    "message", "Upload ảnh thành công!",
                    "imageUrl", imageUrl));
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể upload ảnh");
        }
    }

}
