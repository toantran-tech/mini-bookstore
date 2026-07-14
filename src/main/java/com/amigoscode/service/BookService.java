package com.amigoscode.service;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface BookService {
    Book addBook(Book book);
    List<BookResponse> getAllBooks();

    Page<BookResponse> getAllBooks(
            String search,
            String author,
            String isbn,
            String categoryName,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            int page,
            int size
    );

    BookResponse getBookById(Long id);
    BookResponse updateBook(Long id, BookResponse bookResponse);
    void deleteBookById(Long id);

    List<BookResponse> getSimilarBooks(Long id);

    java.util.Map<String, List<BookResponse>> getTopBooks();

    void incrementViewCount(Long id);
}
