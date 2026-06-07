package com.amigoscode.controller;

import com.amigoscode.Entity.Book;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * BookController — xử lý tất cả request liên quan đến sách.
 *
 * @Tag  : nhóm tất cả endpoint này vào section "Books" trên Swagger UI
 *         → thay vì hiện tên class, Swagger sẽ hiện tên "Books" dễ đọc hơn
 */
@Tag(name = "Books", description = "API quản lý sách — tìm kiếm, lọc, phân trang, top sách")
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    // ─── PUBLIC ENDPOINTS (không cần đăng nhập) ──────────────────────────────

    /**
     * @Operation  : mô tả endpoint này làm gì (hiện trên Swagger UI)
     *   summary   : tiêu đề ngắn — hiện ở dạng collapsed
     *   description: mô tả dài — hiện khi expand
     */
    @Operation(
            summary = "Lấy tất cả sách (không phân trang)",
            description = "Trả về toàn bộ danh sách sách. Dùng nội bộ hoặc cho dropdown."
    )
    @GetMapping
    public List<BookResponse> getAllBooks() {
        return bookService.getAllBooks();
    }

    /**
     * @Parameter : mô tả từng query param để Swagger hiển thị ví dụ và tooltip
     */
    @Operation(
            summary = "Lấy sách có phân trang + filter đa điều kiện",
            description = "Hỗ trợ tìm kiếm theo từ khóa, lọc theo danh mục, khoảng giá, sắp xếp và phân trang."
    )
    @GetMapping("/all")
    public Page<BookResponse> getBooks(
            @Parameter(description = "Từ khóa tìm kiếm theo tên sách hoặc tác giả", example = "Clean Code")
            @RequestParam(required = false) String search,

            @Parameter(description = "Lọc riêng theo tên tác giả", example = "Robert Martin")
            @RequestParam(required = false) String author,

            @Parameter(description = "Lọc theo mã ISBN", example = "978-3-16-148410-0")
            @RequestParam(required = false) String isbn,

            @Parameter(description = "Lọc theo tên danh mục", example = "Fiction")
            @RequestParam(required = false) String categoryName,

            @Parameter(description = "Giá tối thiểu", example = "10.0")
            @RequestParam(required = false) Double minPrice,

            @Parameter(description = "Giá tối đa", example = "50.0")
            @RequestParam(required = false) Double maxPrice,

            @Parameter(description = "Sắp xếp: newest | bestseller | price_asc | price_desc", example = "bestseller")
            @RequestParam(required = false, defaultValue = "") String sortBy,

            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Số sách mỗi trang", example = "8")
            @RequestParam(defaultValue = "8") int size) {

        return bookService.getAllBooks(search, author, isbn, categoryName, minPrice, maxPrice, sortBy, page, size);
    }

    /**
     * @ApiResponses : mô tả các HTTP status code có thể trả về
     *   Swagger sẽ hiện bảng "Responses" với mô tả từng code
     */
    @Operation(
            summary = "Lấy chi tiết 1 sách theo ID",
            description = "Trả về thông tin đầy đủ của sách và tự động tăng viewCount."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tìm thấy sách"),
            @ApiResponse(responseCode = "400", description = "Không tìm thấy sách với ID này")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(
            @Parameter(description = "ID của sách", example = "1")
            @PathVariable Long id) {
        bookService.incrementViewCount(id);
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @Operation(
            summary = "Top 10 sách bán chạy & xem nhiều nhất",
            description = "Trả về Map với 2 key: 'bestsellers' (theo soldCount) và 'mostViewed' (theo viewCount)."
    )
    @GetMapping("/top")
    public ResponseEntity<Map<String, List<BookResponse>>> getTopBooks() {
        return ResponseEntity.ok(bookService.getTopBooks());
    }

    @Operation(
            summary = "Sách tương tự (cùng danh mục)",
            description = "Trả về tối đa 4 sách cùng category với sách đang xem, trừ chính nó."
    )
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<BookResponse>> getSimilarBooks(
            @Parameter(description = "ID của sách hiện tại", example = "1")
            @PathVariable Long id) {
        return ResponseEntity.ok(bookService.getSimilarBooks(id));
    }

    // ─── ADMIN ENDPOINTS (cần JWT + role ADMIN) ───────────────────────────────
    // @SecurityRequirement: chỉ định endpoint này cần JWT trong Swagger UI
    // (các endpoint public không cần annotation này)

    @Operation(
            summary = "[ADMIN] Thêm sách mới",
            description = "Yêu cầu role ADMIN. Dán JWT vào nút Authorize trước khi gọi.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Book addBook(@RequestBody Book book) {
        return bookService.addBook(book);
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin sách",
            description = "Yêu cầu role ADMIN.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookResponse> updateBook(
            @Parameter(description = "ID sách cần cập nhật", example = "1")
            @PathVariable Long id,
            @RequestBody BookResponse bookResponse) {
        return ResponseEntity.ok(bookService.updateBook(id, bookResponse));
    }

    @Operation(
            summary = "[ADMIN] Xóa sách",
            description = "Yêu cầu role ADMIN. Xóa vĩnh viễn, không thể khôi phục.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponse(responseCode = "204", description = "Xóa thành công (No Content)")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBook(
            @Parameter(description = "ID sách cần xóa", example = "1")
            @PathVariable Long id) {
        bookService.deleteBookById(id);
        return ResponseEntity.noContent().build();
    }
}
