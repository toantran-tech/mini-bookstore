package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.OrderStatus;
import com.amigoscode.Entity.Review;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.ReviewRequest;
import com.amigoscode.dto.ReviewResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.ReviewRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;

    @Override
    public ReviewResponse createReview(String username, ReviewRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating phải từ 1 đến 5");
        }

        if (reviewRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
            throw new IllegalStateException("Bạn đã đánh giá cuốn sách này rồi!");
        }

        if (!orderRepository.hasUserPurchasedAndReceivedBook(username, book.getId(), OrderStatus.Delivered)) {
            throw new IllegalStateException("Bạn phải mua và nhận hàng thành công thì mới được đánh giá!");
        }

        Review review = new Review();
        review.setUser(user);
        review.setBook(book);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Override
    public List<ReviewResponse> getReviewsByBook(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public void deleteReview(String username, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review không tồn tại"));

        if (!review.getUser().getUsername().equals(username)) {
            throw new SecurityException("Bạn không có quyền xóa review này!");
        }

        reviewRepository.delete(review);
    }

    @Override
    public Double getAverageRating(Long bookId) {
        Double avg = reviewRepository.findAverageRatingByBookId(bookId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0; // Làm tròn 1 chữ số thập phân
    }

    @Override
    public long countReviews(Long bookId) {
        return reviewRepository.countByBookId(bookId);
    }

    @Override
    public boolean canReview(String username, Long bookId) {
        if (!orderRepository.hasUserPurchasedAndReceivedBook(username, bookId, OrderStatus.Delivered)) {
            return false;
        }
        User user = userRepository.findByUsername(username).orElse(null);
        if (user != null && reviewRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            return false;
        }
        return true;
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getUser().getUsername(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt()
        );
    }
}
