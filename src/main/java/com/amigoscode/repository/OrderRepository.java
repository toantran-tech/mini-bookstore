package com.amigoscode.repository;

import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") Long id);

    List<Order> findByUserUsername(String username);

    /** Paginated order list for the admin dashboard — avoids loading all rows at once. */
    Page<Order> findAll(Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = :status")
    BigDecimal getTotalRevenue(@Param("status") OrderStatus status);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatus();

    List<Order> findByStatus(OrderStatus status);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails d " +
           "WHERE o.user.username = :username AND o.status = :status AND d.book.id = :bookId")
    boolean hasUserPurchasedAndReceivedBook(
            @Param("username") String username,
            @Param("bookId") Long bookId,
            @Param("status") OrderStatus status);

    @Query("SELECT YEAR(o.orderDate), MONTH(o.orderDate), SUM(o.totalAmount) " +
           "FROM Order o WHERE o.status = :status " +
           "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
           "ORDER BY YEAR(o.orderDate) ASC, MONTH(o.orderDate) ASC")
    List<Object[]> findMonthlyRevenue(@Param("status") OrderStatus status);
}
