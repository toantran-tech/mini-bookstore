package com.amigoscode.service;

import com.amigoscode.dto.ReviewRequest;
import com.amigoscode.dto.ReviewResponse;
import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(String username, ReviewRequest request);
    List<ReviewResponse> getReviewsByBook(Long bookId);
    void deleteReview(String username, Long reviewId);
    Double getAverageRating(Long bookId);
    long countReviews(Long bookId);
}
