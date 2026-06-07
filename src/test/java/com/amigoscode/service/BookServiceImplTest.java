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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // ← Bật Mockito trong JUnit 5
class BookServiceImplTest {

    @Mock
    private BookRepository bookRepository;

    @InjectMocks
    private BookServiceImpl bookService;

    private Book sampleBook;
    private Category category;

    @BeforeEach
    void setUp() {
        category = new Category();
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
        sampleBook.setSoldCount(50);
        sampleBook.setViewCount(200);
    }


    @Test
    @DisplayName("addBook: thành công khi dữ liệu hợp lệ")
    void addBook_shouldReturnSavedBook_whenValid() {
        when(bookRepository.save(sampleBook)).thenReturn(sampleBook);

        Book result = bookService.addBook(sampleBook);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Clean Code");
        verify(bookRepository, times(1)).save(sampleBook); // đảm bảo save() được gọi đúng 1 lần
    }

    @Test
    @DisplayName("addBook: ném IllegalArgumentException khi giá âm")
    void addBook_shouldThrowException_whenPriceIsNegative() {
        sampleBook.setPrice(-5.0);

        assertThatThrownBy(() -> bookService.addBook(sampleBook))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Price cannot be negative");

        verify(bookRepository, never()).save(any()); // đảm bảo save() KHÔNG được gọi
    }


    @Test
    @DisplayName("getBookById: trả về BookResponse đầy đủ thông tin khi tìm thấy")
    void getBookById_shouldReturnBookResponse_whenFound() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        BookResponse result = bookService.getBookById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("Clean Code");
        assertThat(result.getAuthor()).isEqualTo("Robert C. Martin");
        assertThat(result.getCategoryName()).isEqualTo("Fiction");
        assertThat(result.getSoldCount()).isEqualTo(50);
        assertThat(result.getViewCount()).isEqualTo(200);
    }

    @Test
    @DisplayName("getBookById: ném IllegalArgumentException khi ID không tồn tại")
    void getBookById_shouldThrowException_whenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getBookById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");
    }


    @Test
    @DisplayName("getAllBooks: trả về danh sách đúng số lượng")
    void getAllBooks_shouldReturnListOfBookResponses() {
        when(bookRepository.findAll()).thenReturn(List.of(sampleBook));

        List<BookResponse> result = bookService.getAllBooks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Clean Code");
    }

    @Test
    @DisplayName("getAllBooks: trả về list rỗng khi không có sách")
    void getAllBooks_shouldReturnEmptyList_whenNoBooksExist() {
        when(bookRepository.findAll()).thenReturn(List.of());

        List<BookResponse> result = bookService.getAllBooks();

        assertThat(result).isEmpty();
    }


    @Test
    @DisplayName("getAllBooks (filter): trả về Page<BookResponse> đúng khi có kết quả")
    void getAllBooks_withFilter_shouldReturnPage() {
        Page<Book> fakePage = new PageImpl<>(List.of(sampleBook));
        when(bookRepository.findWithFilters(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(fakePage);

        Page<BookResponse> result = bookService.getAllBooks(
                "Clean", "Fiction", null, null, 10.0, 50.0, "bestseller", 0, 10);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Clean Code");
    }

    @Test
    @DisplayName("getAllBooks (filter): sort=newest hoạt động không throw exception")
    void getAllBooks_withFilter_sortNewest_shouldNotThrow() {
        when(bookRepository.findWithFilters(any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleBook)));

        Page<BookResponse> result = bookService.getAllBooks(
                null, null, null, null, null, null, "newest", 0, 5);

        assertThat(result).isNotNull();
    }


    @Test
    @DisplayName("updateBook: cập nhật thành công và trả về BookResponse mới")
    void updateBook_shouldReturnUpdatedBookResponse_whenFound() {
        BookResponse updateRequest = new BookResponse();
        updateRequest.setTitle("Clean Code 2nd Ed");
        updateRequest.setAuthor("Robert C. Martin");
        updateRequest.setPrice(39.99);
        updateRequest.setStock(5);
        updateRequest.setImageUrl("https://example.com/new.jpg");
        updateRequest.setDescription("Updated description");

        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(bookRepository.save(any(Book.class))).thenReturn(sampleBook);

        BookResponse result = bookService.updateBook(1L, updateRequest);

        assertThat(result).isNotNull();
        verify(bookRepository, times(1)).save(any(Book.class));
    }

    @Test
    @DisplayName("updateBook: ném exception khi ID không tồn tại")
    void updateBook_shouldThrowException_whenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.updateBook(99L, new BookResponse()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");
    }


    @Test
    @DisplayName("deleteBookById: xóa thành công khi tìm thấy")
    void deleteBookById_shouldDeleteBook_whenFound() {
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        bookService.deleteBookById(1L);

        verify(bookRepository, times(1)).delete(sampleBook);
    }

    @Test
    @DisplayName("deleteBookById: ném exception khi ID không tồn tại")
    void deleteBookById_shouldThrowException_whenNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.deleteBookById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");

        verify(bookRepository, never()).delete(any());
    }


    @Test
    @DisplayName("getSimilarBooks: trả về danh sách sách cùng category")
    void getSimilarBooks_shouldReturnBooksInSameCategory() {
        Book anotherBook = new Book();
        anotherBook.setId(2L);
        anotherBook.setTitle("The Pragmatic Programmer");
        anotherBook.setAuthor("David Thomas");
        anotherBook.setPrice(34.99);
        anotherBook.setStock(8);
        anotherBook.setCategory(category);
        anotherBook.setSoldCount(30);
        anotherBook.setViewCount(100);

        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));
        when(bookRepository.findSimilarBooks(eq(1L), eq(1L), any(Pageable.class)))
                .thenReturn(List.of(anotherBook));

        List<BookResponse> result = bookService.getSimilarBooks(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("The Pragmatic Programmer");
    }

    @Test
    @DisplayName("getSimilarBooks: trả về list rỗng khi sách không có category")
    void getSimilarBooks_shouldReturnEmpty_whenBookHasNoCategory() {
        sampleBook.setCategory(null);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        List<BookResponse> result = bookService.getSimilarBooks(1L);

        assertThat(result).isEmpty();
        verify(bookRepository, never()).findSimilarBooks(any(), any(), any());
    }

    @Test
    @DisplayName("getSimilarBooks: ném exception khi ID không tồn tại")
    void getSimilarBooks_shouldThrowException_whenBookNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> bookService.getSimilarBooks(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Book not found with ID: 99");
    }


    @Test
    @DisplayName("getTopBooks: trả về Map gồm bestsellers và mostViewed")
    void getTopBooks_shouldReturnMapWithBestSellersAndMostViewed() {
        when(bookRepository.findTop10ByOrderBySoldCountDesc()).thenReturn(List.of(sampleBook));
        when(bookRepository.findTop10ByOrderByViewCountDesc()).thenReturn(List.of(sampleBook));

        Map<String, List<BookResponse>> result = bookService.getTopBooks();

        assertThat(result).containsKeys("bestsellers", "mostViewed");
        assertThat(result.get("bestsellers")).hasSize(1);
        assertThat(result.get("mostViewed")).hasSize(1);
        assertThat(result.get("bestsellers").get(0).getSoldCount()).isEqualTo(50);
    }

    @Test
    @DisplayName("getTopBooks: trả về list rỗng khi không có sách nào")
    void getTopBooks_shouldReturnEmptyLists_whenNoBooksExist() {
        when(bookRepository.findTop10ByOrderBySoldCountDesc()).thenReturn(List.of());
        when(bookRepository.findTop10ByOrderByViewCountDesc()).thenReturn(List.of());

        Map<String, List<BookResponse>> result = bookService.getTopBooks();

        assertThat(result.get("bestsellers")).isEmpty();
        assertThat(result.get("mostViewed")).isEmpty();
    }


    @Test
    @DisplayName("incrementViewCount: tăng viewCount thêm 1 khi tìm thấy sách")
    void incrementViewCount_shouldIncreaseViewCountByOne() {
        sampleBook.setViewCount(200);
        when(bookRepository.findById(1L)).thenReturn(Optional.of(sampleBook));

        bookService.incrementViewCount(1L);

        assertThat(sampleBook.getViewCount()).isEqualTo(201);
        verify(bookRepository, times(1)).save(sampleBook);
    }

    @Test
    @DisplayName("incrementViewCount: không throw exception khi ID không tồn tại")
    void incrementViewCount_shouldDoNothing_whenBookNotFound() {
        when(bookRepository.findById(99L)).thenReturn(Optional.empty());

        bookService.incrementViewCount(99L);

        verify(bookRepository, never()).save(any());
    }
}
