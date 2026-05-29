package com.amigoscode.service;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BookService {
    Book addBook(Book book);
    List<BookResponse> getAllBooks();
    Page<BookResponse> getAllBooks(String search, int page, int size);

    BookResponse getBookById(Long id);
    BookResponse updateBook(Long id, BookResponse bookResponse);
    void deleteBookById(Long id);
}
