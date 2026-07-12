package com.amigoscode.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Gửi notification đến 1 user cụ thể.
     * FE subscribe: /user/{username}/queue/notifications
     *
     * @param username  Username người nhận
     * @param title     Tiêu đề thông báo
     * @param message   Nội dung thông báo
     */
    public void sendToUser(String username, String title, String message) {
        if (username == null || username.isBlank()) return;

        Map<String, Object> payload = Map.of(
                "title",   title,
                "message", message,
                "time",    LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM")),
                "read",    false
        );

        messagingTemplate.convertAndSendToUser(username, "/queue/notifications", payload);
    }

    /**
     * Broadcast đến tất cả admin.
     * FE subscribe: /topic/admin-notifications
     */
    public void notifyAdmin(String title, String message) {
        Map<String, Object> payload = Map.of(
                "title",   title,
                "message", message,
                "time",    LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm dd/MM"))
        );
        messagingTemplate.convertAndSend("/topic/admin-notifications", payload);
    }
}
