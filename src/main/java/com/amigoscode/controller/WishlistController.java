package com.amigoscode.controller;

import com.amigoscode.dto.BookResponse;
import com.amigoscode.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Wishlist", description = "API quản lý danh sách sách yêu thích")
@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @Operation(summary = "Lấy danh sách sách yêu thích", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public ResponseEntity<List<BookResponse>> getFavoriteBooks() {
        return ResponseEntity.ok(wishlistService.getFavoriteBooks());
    }

    @Operation(summary = "Bật/Tắt yêu thích một sách", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{bookId}")
    public ResponseEntity<Void> toggleFavoriteBook(@PathVariable Long bookId) {
        wishlistService.toggleFavoriteBook(bookId);
        return ResponseEntity.ok().build();
    }
}
