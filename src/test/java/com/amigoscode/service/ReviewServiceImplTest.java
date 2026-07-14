package com.amigoscode.service;

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
import com.amigoscode.service.impl.ReviewServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private UserRepository userRepository;
    @Mock private BookRepository bookRepository;
    @Mock private OrderRepository orderRepository;

    @InjectMocks private ReviewServiceImpl reviewService;

    private User user;
    private Book book;
    private ReviewRequest validRequest;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("buyer");

        book = new Book();
        book.setId(1L);
        book.setTitle("Clean Code");

        validRequest = new ReviewRequest(1L, 5, "Sách rất hay!");
    }

    // ─── createReview ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("createReview: thành công khi đã mua hàng và chưa review")
    void createReview_shouldSucceed_whenEligible() {
        Review saved = new Review();
        saved.setId(1L);
        saved.setUser(user);
        saved.setBook(book);
        saved.setRating(5);
        saved.setComment("Sách rất hay!");

        when(userRepository.findByUsername("buyer")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(reviewRepository.existsByUserIdAndBookId(1L, 1L)).thenReturn(false);
        when(orderRepository.hasUserPurchasedAndReceivedBook("buyer", 1L, OrderStatus.Delivered)).thenReturn(true);
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);

        ReviewResponse result = reviewService.createReview("buyer", validRequest);

        assertThat(result).isNotNull();
        assertThat(result.getRating()).isEqualTo(5);
        assertThat(result.getComment()).isEqualTo("Sách rất hay!");
    }

    @Test
    @DisplayName("createReview: ném exception khi chưa mua hàng")
    void createReview_shouldThrow_whenNotPurchased() {
        when(userRepository.findByUsername("buyer")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(reviewRepository.existsByUserIdAndBookId(1L, 1L)).thenReturn(false);
        when(orderRepository.hasUserPurchasedAndReceivedBook("buyer", 1L, OrderStatus.Delivered)).thenReturn(false);

        assertThatThrownBy(() -> reviewService.createReview("buyer", validRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("mua và nhận hàng");
    }

    @Test
    @DisplayName("createReview: ném exception khi đã review rồi")
    void createReview_shouldThrow_whenAlreadyReviewed() {
        when(userRepository.findByUsername("buyer")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        when(reviewRepository.existsByUserIdAndBookId(1L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> reviewService.createReview("buyer", validRequest))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("đã đánh giá");
    }

    @Test
    @DisplayName("createReview: ném exception khi rating ngoài phạm vi 1-5")
    void createReview_shouldThrow_whenRatingOutOfRange() {
        validRequest.setRating(6); // invalid

        when(userRepository.findByUsername("buyer")).thenReturn(Optional.of(user));
        when(bookRepository.findById(1L)).thenReturn(Optional.of(book));
        // Không cần stub existsByUserIdAndBookId vì rating check xảy ra trước

        assertThatThrownBy(() -> reviewService.createReview("buyer", validRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Rating phải từ 1 đến 5");
    }

    // ─── deleteReview ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteReview: thành công khi đúng chủ review")
    void deleteReview_shouldSucceed_whenOwner() {
        Review review = new Review();
        review.setId(1L);
        review.setUser(user);

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        reviewService.deleteReview("buyer", 1L);

        verify(reviewRepository).delete(review);
    }

    @Test
    @DisplayName("deleteReview: ném SecurityException khi không phải chủ review")
    void deleteReview_shouldThrow_whenNotOwner() {
        Review review = new Review();
        review.setId(1L);
        review.setUser(user); // owner là "buyer"

        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> reviewService.deleteReview("hacker", 1L))
                .isInstanceOf(SecurityException.class)
                .hasMessageContaining("không có quyền");

        verify(reviewRepository, never()).delete(any());
    }

    // ─── getAverageRating ─────────────────────────────────────────────────────

    @Test
    @DisplayName("getAverageRating: làm tròn 1 chữ số thập phân")
    void getAverageRating_shouldRoundToOneDecimal() {
        when(reviewRepository.findAverageRatingByBookId(1L)).thenReturn(4.666);

        Double result = reviewService.getAverageRating(1L);

        assertThat(result).isEqualTo(4.7);
    }

    @Test
    @DisplayName("getAverageRating: trả về 0.0 khi chưa có review")
    void getAverageRating_shouldReturnZero_whenNoReviews() {
        when(reviewRepository.findAverageRatingByBookId(1L)).thenReturn(null);

        Double result = reviewService.getAverageRating(1L);

        assertThat(result).isEqualTo(0.0);
    }

    // ─── canReview ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("canReview: trả về true khi đủ điều kiện")
    void canReview_shouldReturnTrue_whenEligible() {
        when(orderRepository.hasUserPurchasedAndReceivedBook("buyer", 1L, OrderStatus.Delivered)).thenReturn(true);
        when(userRepository.findByUsername("buyer")).thenReturn(Optional.of(user));
        when(reviewRepository.existsByUserIdAndBookId(1L, 1L)).thenReturn(false);

        assertThat(reviewService.canReview("buyer", 1L)).isTrue();
    }

    @Test
    @DisplayName("canReview: trả về false khi chưa mua hàng")
    void canReview_shouldReturnFalse_whenNotPurchased() {
        when(orderRepository.hasUserPurchasedAndReceivedBook("buyer", 1L, OrderStatus.Delivered)).thenReturn(false);

        assertThat(reviewService.canReview("buyer", 1L)).isFalse();
    }
}
