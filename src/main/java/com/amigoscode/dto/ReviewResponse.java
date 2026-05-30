package com.amigoscode.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String username;    // Người review
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
