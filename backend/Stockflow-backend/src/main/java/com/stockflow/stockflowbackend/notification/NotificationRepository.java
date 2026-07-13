package com.stockflow.stockflowbackend.notification;

import com.stockflow.stockflowbackend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
    List<Notification> findByBusinessIdAndReadFalse(Long businessId);
    boolean existsByBusinessIdAndCategoryAndCreatedAtAfter(
            Long businessId, String category, LocalDateTime after);
}
