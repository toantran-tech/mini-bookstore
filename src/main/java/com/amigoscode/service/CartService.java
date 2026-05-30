package com.amigoscode.service;

import com.amigoscode.dto.CartResponse;

public interface CartService {
    CartResponse getCart(String username);

    CartResponse addToCart(String username, Long bookId, Integer quantity);

    CartResponse updateCartItem(String username, Long cartItemId, Integer quantity);

    void removeCartItem(String username, Long cartItemId);

    void clearCart(String username);
}
