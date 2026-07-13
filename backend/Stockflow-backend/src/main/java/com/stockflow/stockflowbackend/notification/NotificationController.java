package com.stockflow.stockflowbackend.notification;

import com.stockflow.stockflowbackend.dto.NotificationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    private Long getBusinessId(Authentication auth) {
        return (Long) auth.getDetails();
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> list(Authentication auth) {
        return ResponseEntity.ok(notificationService.list(getBusinessId(auth)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication auth) {
        notificationService.markRead(id, getBusinessId(auth));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        notificationService.markAllRead(getBusinessId(auth));
        return ResponseEntity.ok().build();
    }
}
