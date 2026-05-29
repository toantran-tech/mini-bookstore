package com.amigoscode.service;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Category;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.service.impl.BookServiceImpl;
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
class BookServiceImplTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book sampleBook;

    @BeforeEach
    void setUp() {
        Category category = new Category();
        category.setId(1L);
        category.setName("Fiction");

        sampleBook = new Book();
        sampleBook.setId(1L);
        sampleBook.setTitle("Clean Code");
        sampleBook.setAuthor("Robert C. Martin");
        sampleBook.setPrice(29.99);
        sampleBook.setStock(10);
        sampleBook.setCategory(category);
        sampleBook.setImageUrl("https://example.com/clean-code.jpg");
        sampleBook.setDescription("A handbook of agile software craftsmanship.");
    }

    // ─── addBook ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("addBook: thành công khi dữ liệu hợp lệ")
    void addBook_shouldReturnSavedBook_whenValid() {
        when(bookRepository.save(sampleBook)).thenReturn(sampleBook);

        Book result = bookService.addBook(sampleBook);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Clean Code");
        verify(bookRepository, times(1)).save(sampleBook);
    }

    @Test
    @DisplayName("addBook: ném IllegalArgumentException khi giá âm")
    void addBook_shouldThrowException_whenPriceIsNegative() {
        sampleBook.setPrice(-5.0);

        assertThatThrownBy(() -> bookService.addBook(sampleBook))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Price cannot be negative");

        verify(bookRepository, never()).save(any());
    }

    // ─── getBookById ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("getBookById: trả về BookResponse khi tìm thấy")
    void getBookById_shouldReturnBookResponse_whenFound() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        BookResponse result = bookService.getBookById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Clean Code");
        assertThat(result.getAuthor()).isEqualTo("Robert C. Martin");
        assertThat(result.getCategoryName()).isEqualTo("Fiction");
        assertThat(result.getImageUrl()).isEqualTo("https://example.com/clean-code.jpg");
    }

    @Test
    @DisplayName("getBookById: ném IllegalArgumentException khi không tìm thấy")
    void getBookById_shouldThrowException_whenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBookById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");
    }

    // ─── getAllBooks ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllBooks: trả về danh sách đúng số lượng")
    void getAllBooks_shouldReturnListOfBookResponses() {
        when(bookRepository.findAll()).thenReturn(List.of(sampleBook));

        List<BookResponse> result = bookService.getAllBooks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Clean Code");
    }

    // ─── deleteBookById ───────────────────────────────────────────────────────

    @Test
    @DisplayName("deleteBookById: xóa thành công khi tìm thấy")
    void deleteBookById_shouldDeleteBook_whenFound() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        bookService.deleteBookById(1L);

        verify(bookRepository, times(1)).delete(sampleBook);
    }

    @Test
    @DisplayName("deleteBookById: ném IllegalArgumentException khi không tìm thấy")
    void deleteBookById_shouldThrowException_whenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.deleteBookById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");

        verify(bookRepository, never()).delete(any());
    }
}
