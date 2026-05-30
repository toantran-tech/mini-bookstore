package com.amigoscode.service.impl;

import com.amigoscode.Entity.*;
import com.amigoscode.dto.CartItemResponse;
import com.amigoscode.dto.CartResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.CartItemRepository;
import com.amigoscode.repository.CartRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    private CartItemResponse toItemResponse(CartItem item) {
        CartItemResponse res = new CartItemResponse();
        res.setId(item.getId());
        res.setBookId(item.getBook().getId());
        res.setBookTitle(item.getBook().getTitle());
        res.setBookAuthor(item.getBook().getAuthor());
        res.setImageUrl(item.getBook().getImageUrl());
        res.setPrice(item.getBook().getPrice());
        res.setQuantity(item.getQuantity());
        res.setSubtotal(item.getBook().getPrice() * item.getQuantity());
        return res;
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        double totalPrice = itemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        int totalItems = itemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        CartResponse res = new CartResponse();
        res.setCartId(cart.getId());
        res.setItems(itemResponses);
        res.setTotalPrice(totalPrice);
        res.setTotalItems(totalItems);
        return res;
    }

    private Cart getOrCreateCart(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    @Override
    public CartResponse getCart(String username) {
        Cart cart = getOrCreateCart(username);
        return toCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(String username, Long bookId, Integer quantity) {
        Cart cart = getOrCreateCart(username);

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Sách không tồn tại"));

        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setBook(book);
            newItem.setQuantity(quantity);
            cart.getItems().add(newItem);
        }

        Cart savedCart = cartRepository.save(cart);
        return toCartResponse(savedCart);
    }

    @Override
    public CartResponse updateCartItem(String username, Long cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem không tồn tại"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        Cart cart = cartRepository.findByUserId(
                userRepository.findByUsername(username).get().getId()).get();
        return toCartResponse(cart);
    }

    @Override
    public void removeCartItem(String username, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem không tồn tại"));
        cartItemRepository.delete(item);
    }

    @Override
    public void clearCart(String username) {
        Cart cart = getOrCreateCart(username);
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
