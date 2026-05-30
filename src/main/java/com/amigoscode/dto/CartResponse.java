package com.amigoscode.dto;

import lombok.Data;
import java.util.List;

@Data
public class CartResponse {
    private Long cartId;
    private List<CartItemResponse> items;
    private Double totalPrice; // Tổng cộng toàn bộ giỏ hàng
    private Integer totalItems; // Tổng số lượng sản phẩm
}
