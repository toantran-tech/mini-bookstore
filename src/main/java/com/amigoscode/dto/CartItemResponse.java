package com.amigoscode.dto;

import lombok.Data;

@Data
public class CartItemResponse {
    private Long id; // ID của CartItem
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String imageUrl; // Ảnh bìa sách
    private Double price;
    private Integer quantity;
    private Double subtotal; // = price * quantity
}
