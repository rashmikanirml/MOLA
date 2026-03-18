package com.mola.service;

import com.mola.entity.Notification;
import com.mola.entity.NotificationType;
import com.mola.exception.ResourceNotFoundException;
import com.mola.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification create(String username, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .username(username)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        return notificationRepository.save(notification);
    }

    public List<Notification> getForUser(String username, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        }
        return notificationRepository.findByUsernameOrderByCreatedAtDesc(username);
    }

    public Notification markRead(Long id, String username) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        if (!notification.getUsername().equals(username)) {
            throw new IllegalArgumentException("You can only mark your own notifications as read");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllRead(String username) {
        List<Notification> notifications = notificationRepository.findByUsernameAndIsReadFalseOrderByCreatedAtDesc(username);
        notifications.forEach(item -> item.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
