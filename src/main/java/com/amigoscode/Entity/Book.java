package com.amigoscode.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(unique = true)
    private String isbn;

    @Column(nullable = false)
    private double price;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false)
    private Integer stock;

    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Số lượng đã bán — tăng mỗi khi có order
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer soldCount = 0;

    // Số lượng lượt xem — tăng khi user mở trang chi tiết
    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private Integer viewCount = 0;

    // Nhiều ảnh, lưu dạng comma-separated URL: "url1,url2,url3"
    @Column(columnDefinition = "TEXT")
    private String imageUrls;

    // Thời điểm tạo — tự động set, dùng để sort "mới nhất"
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
