package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.BookResponse;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookResponse> getFavoriteBooks() {
        User user = getCurrentUser();
        return user.getFavoriteBooks().stream()
                .map(this::mapToBookResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleFavoriteBook(Long bookId) {
        User user = getCurrentUser();
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        if (user.getFavoriteBooks().contains(book)) {
            user.getFavoriteBooks().remove(book);
        } else {
            user.getFavoriteBooks().add(book);
        }
        
        userRepository.save(user);
    }

    private BookResponse mapToBookResponse(Book book) {
        BookResponse response = new BookResponse();
        response.setId(book.getId());
        response.setTitle(book.getTitle());
        response.setAuthor(book.getAuthor());
        response.setPrice(book.getPrice());
        response.setStock(book.getStock());
        response.setImageUrl(book.getImageUrl());
        response.setDescription(book.getDescription());
        response.setSoldCount(book.getSoldCount() != null ? book.getSoldCount() : 0);
        response.setViewCount(book.getViewCount() != null ? book.getViewCount() : 0);
        response.setImageUrls(book.getImageUrls());
        response.setCreatedAt(book.getCreatedAt());

        if (book.getCategory() != null) {
            response.setCategoryName(book.getCategory().getName());
        }
        return response;
    }
}
