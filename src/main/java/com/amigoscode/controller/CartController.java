package com.amigoscode.controller;

import com.amigoscode.dto.CartResponse;
import com.amigoscode.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(cartService.getCart(username));
    }

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(
            Authentication authentication,
            @RequestParam Long bookId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        String username = authentication.getName();
        return ResponseEntity.ok(cartService.addToCart(username, bookId, quantity));
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartResponse> updateItem(
            Authentication authentication,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        String username = authentication.getName();
        return ResponseEntity.ok(cartService.updateCartItem(username, cartItemId, quantity));
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Void> removeItem(
            Authentication authentication,
            @PathVariable Long cartItemId) {
        String username = authentication.getName();
        cartService.removeCartItem(username, cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        String username = authentication.getName();
        cartService.clearCart(username);
        return ResponseEntity.noContent().build();
    }
}
