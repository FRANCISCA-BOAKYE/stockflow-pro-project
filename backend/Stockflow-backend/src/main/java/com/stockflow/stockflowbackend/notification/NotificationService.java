package com.stockflow.stockflowbackend.notification;

import com.stockflow.stockflowbackend.dto.NotificationResponse;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Notification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public void notify(Business recipient, String category, String type, String title, String body) {
        Notification notification = new Notification();
        notification.setBusiness(recipient);
        notification.setCategory(category);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notificationRepository.save(notification);
    }

    /**
     * Like notify(), but skips creating a duplicate if this business already received
     * a notification of the same category within the given window. Used for
     * scheduled/recurring checks (e.g. trial-ending reminders) so they don't spam on every run.
     */
    @Transactional
    public void notifyOnce(Business recipient, String category, String type, String title,
                            String body, LocalDateTime dedupeWindowStart) {
        if (notificationRepository.existsByBusinessIdAndCategoryAndCreatedAtAfter(
                recipient.getId(), category, dedupeWindowStart)) {
            return;
        }
        notify(recipient, category, type, title, body);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long businessId) {
        return notificationRepository.findByBusinessIdOrderByCreatedAtDesc(businessId)
                .stream()
                .map(n -> new NotificationResponse(
                        n.getId(), n.getType(), n.getTitle(), n.getBody(),
                        n.getRead(), n.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void markRead(Long notificationId, Long callerBusinessId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!callerBusinessId.equals(notification.getBusiness().getId())) {
            throw new RuntimeException("Unauthorized: this notification does not belong to your business");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllRead(Long businessId) {
        List<Notification> unread = notificationRepository.findByBusinessIdAndReadFalse(businessId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
