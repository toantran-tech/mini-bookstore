package com.amigoscode.repository;

import com.amigoscode.Entity.Book;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Book findByAuthor(String author);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id")
    Optional<Book> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT b FROM Book b WHERE " +
            "(:keyword IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "(:author IS NULL OR LOWER(b.author) LIKE LOWER(CONCAT('%', :author, '%'))) AND " +
            "(:isbn IS NULL OR b.isbn = :isbn) AND " +
            "(:categoryName IS NULL OR b.category.name = :categoryName) AND " +
            "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR b.price <= :maxPrice)")
    Page<Book> findWithFilters(
            @Param("keyword") String keyword,
            @Param("author") String author,
            @Param("isbn") String isbn,
            @Param("categoryName") String categoryName,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    List<Book> findTop10ByOrderBySoldCountDesc();

    List<Book> findTop10ByOrderByViewCountDesc();

    @Query("SELECT b FROM Book b WHERE b.category.id = :categoryId AND b.id <> :excludeId ORDER BY b.soldCount DESC")
    List<Book> findSimilarBooks(@Param("categoryId") Long categoryId, @Param("excludeId") Long excludeId, Pageable pageable);

    Page<Book> findByTitleContainingIgnoreCaseAndCategoryName(String title, String categoryName, Pageable pageable);
}
