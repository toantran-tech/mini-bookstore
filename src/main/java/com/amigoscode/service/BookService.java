package com.amigoscode.service;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface BookService {
    Book addBook(Book book);
    List<BookResponse> getAllBooks();

    // Tìm kiếm + lọc đa điều kiện
    Page<BookResponse> getAllBooks(
            String search,
            String author,
            String isbn,
            String categoryName,
            Double minPrice,
            Double maxPrice,
            String sortBy,
            int page,
            int size
    );

    BookResponse getBookById(Long id);
    BookResponse updateBook(Long id, BookResponse bookResponse);
    void deleteBookById(Long id);

    // Sản phẩm tương tự (cùng category)
    List<BookResponse> getSimilarBooks(Long id);

    // Top 10 bán chạy + xem nhiều
    java.util.Map<String, List<BookResponse>> getTopBooks();

    // Tăng lượt xem khi user mở trang chi tiết
    void incrementViewCount(Long id);
}
