package com.amigoscode.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String isbn;
    private String categoryName;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private String description;
    private Integer soldCount;
    private Integer viewCount;
    private String imageUrls;       // comma-separated URLs
    private LocalDateTime createdAt;
}
