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

    // Tổng doanh thu (chỉ tính đơn đã giao)
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'Delivered'")
    double getTotalRevenue();

    // Đếm đơn theo trạng thái: trả về List<Object[]> với [status, count]
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatus();

    // Doanh thu theo tháng trong 12 tháng gần nhất
    @Query(value = "SELECT DATE_FORMAT(order_date, '%Y-%m') as month, SUM(total_amount) as revenue " +
            "FROM orders WHERE status = 'Delivered' AND order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) " +
            "GROUP BY DATE_FORMAT(order_date, '%Y-%m') ORDER BY month ASC", nativeQuery = true)
    List<Object[]> getRevenueByMonth();

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.orderDetails d WHERE o.user.username = :username AND o.status = 'Delivered' AND d.book.id = :bookId")
    boolean hasUserPurchasedAndReceivedBook(@org.springframework.data.repository.query.Param("username") String username, @org.springframework.data.repository.query.Param("bookId") Long bookId);
}

