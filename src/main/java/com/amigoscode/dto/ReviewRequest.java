package com.amigoscode.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull(message = "bookId không được để trống")
    private Long bookId;

    @Min(value = 1, message = "Đánh giá tối thiểu 1 sao")
    private int rating; // 1 - 5

    @NotBlank(message = "Nội dung đánh giá không được để trống")
    private String comment;
}
