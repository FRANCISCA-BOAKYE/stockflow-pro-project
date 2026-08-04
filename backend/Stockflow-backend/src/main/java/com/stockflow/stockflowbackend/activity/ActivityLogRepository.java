package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.model.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    Page<ActivityLog> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);

    Page<ActivityLog> findByBusinessIdAndActorIdOrderByCreatedAtDesc(
            Long businessId, Long actorId, Pageable pageable);

    Page<ActivityLog> findByBusinessIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long businessId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    interface MonthlyCount {
        Integer getYear();
        Integer getMonth();
        Long getEntryCount();
    }

    @Query(value =
            "SELECT EXTRACT(YEAR FROM created_at)::int AS year, " +
            "       EXTRACT(MONTH FROM created_at)::int AS month, " +
            "       COUNT(*) AS entryCount " +
            "FROM activity_logs " +
            "WHERE business_id = :businessId " +
            "GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at) " +
            "ORDER BY year DESC, month DESC",
            nativeQuery = true)
    List<MonthlyCount> countByMonth(@Param("businessId") Long businessId);
}
