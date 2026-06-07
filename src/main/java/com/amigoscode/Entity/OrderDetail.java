package com.amigoscode.Entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore          // Chặn vòng lặp Order → OrderDetail → Order
    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;
    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;;

    @Column(nullable = false)
    private int quantity; // Số lượng cuốn sách này

    @Column(nullable = false)
    private double price; // Giá của cuốn sách tại thời điểm đặt hàng
}
