package com.amigoscode.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.amigoscode.Entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

}
