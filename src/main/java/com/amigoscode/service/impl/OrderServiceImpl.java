package com.amigoscode.service.impl;

import com.amigoscode.Entity.Book;
import com.amigoscode.Entity.Order;
import com.amigoscode.Entity.OrderDetail;
import com.amigoscode.Entity.User;
import com.amigoscode.dto.OrderHistoryResponse;
import com.amigoscode.dto.OrderItemResponse;
import com.amigoscode.dto.OrderItemRequest;
import com.amigoscode.dto.OrderRequest;
import com.amigoscode.repository.BookRepository;
import com.amigoscode.repository.OrderRepository;
import com.amigoscode.repository.UserRepository;
import com.amigoscode.service.OrderService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    public OrderServiceImpl(OrderRepository orderRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }
    @Override
    @Transactional
    public Order placeOrder(String username, OrderRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found with username: " + username));
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("Pending");
        double totalAmount = 0.0;
        List<OrderDetail> orderDetails = new java.util.ArrayList<>();
        for(OrderItemRequest itemRequest : request.getItems()){
            Book book = bookRepository.findById(itemRequest.getBookId())
                    .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + itemRequest.getBookId()));
            if(book.getStock() < itemRequest.getQuantity()){
                throw new IllegalArgumentException("Not enough stock for book: " + book.getTitle());
            }
            book.setStock(book.getStock() - itemRequest.getQuantity());
            bookRepository.save(book);


            totalAmount += book.getPrice() * itemRequest.getQuantity();


            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setBook(book);
            detail.setQuantity(itemRequest.getQuantity());
            detail.setPrice(book.getPrice());

            orderDetails.add(detail);
        }
        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails);


        return orderRepository.save(order);


    }

    @Override
    public List<Order> findByUserId(Long userId) {
        return List.of();
    }

    @Override
    public List<OrderHistoryResponse> getMyOrderHistory(String username) {
        List<Order> orders = orderRepository.findByUserUsername(username);
        return orders.stream().map(order -> {
            OrderHistoryResponse response = new OrderHistoryResponse();
            response.setId(order.getId());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());
            response.setStatus(order.getStatus());

            // Map list chi tiết đơn hàng
            List<OrderItemResponse> items = order.getOrderDetails().stream()
                    .map(detail -> new OrderItemResponse(
                            detail.getBook().getTitle(),
                            detail.getQuantity(),
                            detail.getPrice()
                    )).toList();

            response.setItems(items);
            return response;
        }).toList();
    }
}
