package com.amigoscode.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private Double totalPrice; 
    private Integer totalItems;
} 
