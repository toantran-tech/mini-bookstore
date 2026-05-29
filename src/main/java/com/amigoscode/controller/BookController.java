package com.amigoscode.controller;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // Lấy tất cả không phân trang (dùng nội bộ)
    @GetMapping
    public List<BookResponse> getAllBooks() {
        return bookService.getAllBooks();
    }

    // Lấy sách có phân trang + filter đa điều kiện
    @GetMapping("/all")
    public Page<BookResponse> getBooks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String categoryName,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false, defaultValue = "") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {
        return bookService.getAllBooks(search, categoryName, minPrice, maxPrice, sortBy, page, size);
    }

    // Lấy chi tiết 1 sách + increment viewCount
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        bookService.incrementViewCount(id); // Tăng lượt xem
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    // Top 10 bán chạy + xem nhiều
    @GetMapping("/top")
    public ResponseEntity<java.util.Map<String, java.util.List<BookResponse>>> getTopBooks() {
        return ResponseEntity.ok(bookService.getTopBooks());
    }

    // Sản phẩm tương tự (cùng category)
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<BookResponse>> getSimilarBooks(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getSimilarBooks(id));
    }

    // ADMIN: Thêm sách
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    // ADMIN: Sửa sách
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(@PathVariable Long id, @RequestBody BookResponse bookResponse) {
        return ResponseEntity.ok(bookService.updateBook(id, bookResponse));
    }

    // ADMIN: Xóa sách
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBookById(id);
        return ResponseEntity.noContent().build();
    }
}
