package com.amigoscode.controller;

import com.amigoscode.dto.ReviewRequest;
import com.amigoscode.dto.ReviewResponse;
import com.amigoscode.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // POST /api/reviews — Tạo review mới (cần đăng nhập)
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            Authentication authentication,
            @RequestBody ReviewRequest request) {
        String username = authentication.getName();
        return ResponseEntity.ok(reviewService.createReview(username, request));
    }

    // GET /api/reviews/book/{bookId} — Lấy tất cả review của 1 cuốn sách (public)
    @GetMapping("/book/{bookId}")
    public ResponseEntity<Map<String, Object>> getReviewsByBook(@PathVariable Long bookId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByBook(bookId);
        Double avgRating = reviewService.getAverageRating(bookId);
        long count = reviewService.countReviews(bookId);

        return ResponseEntity.ok(Map.of(
                "reviews", reviews,
                "averageRating", avgRating,
                "totalReviews", count
        ));
    }

    // DELETE /api/reviews/{id} — Xóa review của mình
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(
            Authentication authentication,
            @PathVariable Long id) {
        String username = authentication.getName();
        reviewService.deleteReview(username, id);
        return ResponseEntity.noContent().build();
    }
}
