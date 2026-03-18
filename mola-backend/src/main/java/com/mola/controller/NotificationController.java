package com.mola.controller;

import com.mola.entity.Notification;
import com.mola.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getForUser(authentication.getName(), unreadOnly));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(notificationService.markRead(id, authentication.getName()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication authentication) {
        notificationService.markAllRead(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
