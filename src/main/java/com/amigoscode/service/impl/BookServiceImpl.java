package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.service.BookService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;
    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }
    @Override
    public Book addBook(Book book) {
        if(book.getPrice() < 0){
            throw new IllegalArgumentException("Price cannot be negative");
        }
        return bookRepository.save(book);
    }
    @Override
    public List<BookResponse> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        return books.stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Override
    public Page<BookResponse> getAllBooks(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page,size);

        Page<Book> bookPage = bookRepository.findByTitleContainingIgnoreCase(search,pageable);
        return bookPage.map(book -> {
            BookResponse response = new BookResponse();
            response.setId(book.getId());
            response.setTitle(book.getTitle());
            response.setAuthor(book.getAuthor());
            response.setPrice(book.getPrice());
            response.setStock(book.getStock());

            if (book.getCategory() != null) {
                response.setCategoryName(book.getCategory().getName());
            }

            return response;
         });


    }

    @Override
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));
        return mapToBookResponse(book);
    }

    @Override
    public BookResponse updateBook(Long id, BookResponse bookResponse) {
Book book =bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));

        book.setTitle(bookResponse.getTitle());
        book.setAuthor(bookResponse.getAuthor());
        book.setPrice(bookResponse.getPrice());
        book.setStock(bookResponse.getStock());
        book.setImageUrl(bookResponse.getImageUrl());
        book.setDescription(bookResponse.getDescription());
        Book updatedBook = bookRepository.save(book);
        return mapToBookResponse(updatedBook);  }

    @Override
    public void deleteBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));
        bookRepository.delete(book);
    }

    private BookResponse mapToBookResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setPrice(book.getPrice());
        response.setStock(book.getStock());
        response.setImageUrl(book.getImageUrl());
        response.setDescription(book.getDescription());

        if (book.getCategory() != null) {
            response.setCategoryName(book.getCategory().getName());
        }
        return response;
    }
}

