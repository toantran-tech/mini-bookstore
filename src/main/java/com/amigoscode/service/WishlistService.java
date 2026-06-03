package com.amigoscode.service;

import com.amigoscode.dto.BookResponse;
import java.util.List;

public interface WishlistService {
    List<BookResponse> getFavoriteBooks();
    void toggleFavoriteBook(Long bookId);
}
