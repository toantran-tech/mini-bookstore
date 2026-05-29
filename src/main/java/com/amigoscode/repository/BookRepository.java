package com.amigoscode.repository;

import com.amigoscode.Entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Book findByAuthor(String author);
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
