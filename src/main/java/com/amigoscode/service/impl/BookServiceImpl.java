package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.service.BookService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;

    public BookServiceImpl(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Override
    @CacheEvict(value = "topBooks", allEntries = true)
    public Book addBook(Book book) {
        if (book.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        return bookRepository.save(book);
    }

    @Override
    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Override
    public Page<BookResponse> getAllBooks(
            String search,
            String author,
            String isbn,
            String categoryName,
            Double minPrice,
            Double maxPrice,
            String sortBy,
            int page,
            int size) {
        // Xác định sort direction
        Sort sort = switch (sortBy == null ? "" : sortBy) {
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "bestseller" -> Sort.by(Sort.Direction.DESC, "soldCount");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            default -> Sort.by(Sort.Direction.DESC, "id");
        };

        Pageable pageable = PageRequest.of(page, size, sort);

        // Chuẩn hóa params
        String keyword = (search == null || search.isBlank()) ? null : search;
        String authorKeyword = (author == null || author.isBlank()) ? null : author;
        String catName = (categoryName == null || categoryName.isBlank()) ? null : categoryName;

        String isbnParam = (isbn == null || isbn.isBlank()) ? null : isbn;

        return bookRepository
                .findWithFilters(keyword, authorKeyword, isbnParam, catName, minPrice, maxPrice, pageable)
                .map(this::mapToBookResponse);
    }

    @Override
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));
        return mapToBookResponse(book);
    }

    @Override
    @CacheEvict(value = "topBooks", allEntries = true)
    public BookResponse updateBook(Long id, BookResponse bookResponse) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));

        book.setTitle(bookResponse.getTitle());
        book.setAuthor(bookResponse.getAuthor());
        book.setPrice(bookResponse.getPrice());
        book.setStock(bookResponse.getStock());
        book.setImageUrl(bookResponse.getImageUrl());
        book.setDescription(bookResponse.getDescription());
        book.setIsbn(bookResponse.getIsbn());
        if (bookResponse.getImageUrls() != null) {
            book.setImageUrls(bookResponse.getImageUrls());
        }

        return mapToBookResponse(bookRepository.save(book));
    }

    @Override
    @CacheEvict(value = "topBooks", allEntries = true)
    public void deleteBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));
        bookRepository.delete(book);
    }

    @Override
    public List<BookResponse> getSimilarBooks(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));

        if (book.getCategory() == null)
            return List.of();

        Pageable top4 = PageRequest.of(0, 4);
        return bookRepository
                .findSimilarBooks(book.getCategory().getId(), id, top4)
                .stream()
                .map(this::mapToBookResponse)
                .toList();
    }

    @Override
    @Cacheable(value = "topBooks")
    public java.util.Map<String, List<BookResponse>> getTopBooks() {
        List<BookResponse> bestsellers = bookRepository.findTop10ByOrderBySoldCountDesc()
                .stream().map(this::mapToBookResponse).toList();
        List<BookResponse> mostViewed = bookRepository.findTop10ByOrderByViewCountDesc()
                .stream().map(this::mapToBookResponse).toList();
        return java.util.Map.of(
                "bestsellers", bestsellers,
                "mostViewed", mostViewed);
    }

    @Override
    @CacheEvict(value = "topBooks", allEntries = true)
    public void incrementViewCount(Long id) {
        bookRepository.findById(id).ifPresent(book -> {
            book.setViewCount((book.getViewCount() == null ? 0 : book.getViewCount()) + 1);
            bookRepository.save(book);
        });
    }

    // ===================== HELPER =====================

    private BookResponse mapToBookResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setPrice(book.getPrice());
        response.setStock(book.getStock());
        response.setIsbn(book.getIsbn());
        response.setImageUrl(book.getImageUrl());
        response.setDescription(book.getDescription());
        response.setSoldCount(book.getSoldCount() != null ? book.getSoldCount() : 0);
        response.setViewCount(book.getViewCount() != null ? book.getViewCount() : 0);
        response.setImageUrls(book.getImageUrls());
        response.setCreatedAt(book.getCreatedAt());

        if (book.getCategory() != null) {
            response.setCategoryName(book.getCategory().getName());
        }
        return response;
    }
}
