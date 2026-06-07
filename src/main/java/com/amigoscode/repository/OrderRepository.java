package com.amigoscode.repository;

import com.amigoscode.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByUserUsername(String username);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'Delivered'")
    double getTotalRevenue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatus();

    List<Order> findByStatus(String status);

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails d WHERE o.user.username = :username AND o.status = 'Delivered' AND d.book.id = :bookId")
    boolean hasUserPurchasedAndReceivedBook(
            @org.springframework.data.repository.query.Param("username") String username,
            @org.springframework.data.repository.query.Param("bookId") Long bookId);

    @Query("SELECT YEAR(o.orderDate), MONTH(o.orderDate), SUM(o.totalAmount) " +
           "FROM Order o WHERE o.status = 'Delivered' " +
           "GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) " +
           "ORDER BY YEAR(o.orderDate) ASC, MONTH(o.orderDate) ASC")
    List<Object[]> findMonthlyRevenue();
}
