package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.ActivityLogResponse;
import com.stockflow.stockflowbackend.dto.ActivityMonthResponse;
import com.stockflow.stockflowbackend.model.ActivityLog;
import com.stockflow.stockflowbackend.model.ActivityLogClearance;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class ActivityLogService {

    private static final Logger log = LoggerFactory.getLogger(ActivityLogService.class);
    private static final int REVIEW_WINDOW_DAYS = 3;

    private final ActivityLogRepository activityLogRepository;
    private final ActivityLogClearanceRepository clearanceRepository;
    private final BusinessRepository businessRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              ActivityLogClearanceRepository clearanceRepository,
                              BusinessRepository businessRepository) {
        this.activityLogRepository = activityLogRepository;
        this.clearanceRepository = clearanceRepository;
        this.businessRepository = businessRepository;
    }

    /**
     * Records one audit entry. Never allowed to break the action it's logging —
     * a logging failure is swallowed and reported, not propagated.
     */
    @Transactional
    public void log(Business business, AppUser actor, String actionType, String description, BigDecimal amountUsd) {
        try {
            ActivityLog entry = new ActivityLog();
            entry.setBusiness(business);
            entry.setActor(actor);
            entry.setActorName(actor != null ? actor.getName() : "Unknown");
            entry.setActorIsSubAccount(actor != null && Boolean.TRUE.equals(actor.getIsSubAccount()));
            entry.setActionType(actionType);
            entry.setDescription(description);
            entry.setAmountUsd(amountUsd);
            activityLogRepository.save(entry);
        } catch (Exception e) {
            log.warn("Failed to write activity log for business {}: {}",
                    business != null ? business.getId() : null, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> list(Long businessId, Long actorId, int page, int size) {
        return list(businessId, actorId, null, null, page, size);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLogResponse> list(Long businessId, Long actorId, Integer year, Integer month, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ActivityLog> entries;
        if (year != null && month != null) {
            LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime end = start.plusMonths(1);
            entries = activityLogRepository.findByBusinessIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                    businessId, start, end, pageable);
        } else {
            entries = actorId != null
                    ? activityLogRepository.findByBusinessIdAndActorIdOrderByCreatedAtDesc(businessId, actorId, pageable)
                    : activityLogRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
        }
        return entries.map(e -> new ActivityLogResponse(
                e.getId(), e.getActorName(), e.getActorIsSubAccount(), e.getActionType(),
                e.getDescription(), e.getAmountUsd(), e.getCreatedAt()));
    }

    /**
     * Groups activity by month for the review/clear workflow. A month only
     * becomes clearable {@value #REVIEW_WINDOW_DAYS} days after it ends, giving
     * time for any late-posted activity to settle before the owner is prompted
     * to review it.
     */
    @Transactional(readOnly = true)
    public List<ActivityMonthResponse> listMonths(Long businessId) {
        List<ActivityLogClearance> clearances = clearanceRepository.findByBusinessId(businessId);
        LocalDateTime now = LocalDateTime.now();

        return activityLogRepository.countByMonth(businessId).stream().map(row -> {
            int year = row.getYear();
            int month = row.getMonth();
            Optional<ActivityLogClearance> clearance = clearances.stream()
                    .filter(c -> c.getYear() == year && c.getMonth() == month)
                    .findFirst();

            LocalDateTime clearableFrom = LocalDateTime.of(year, month, 1, 0, 0)
                    .plusMonths(1).plusDays(REVIEW_WINDOW_DAYS);
            boolean canClear = clearance.isEmpty() && now.isAfter(clearableFrom);

            String label = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year;

            return new ActivityMonthResponse(
                    year, month, label, row.getEntryCount(),
                    clearance.map(ActivityLogClearance::getClearedAt).orElse(null),
                    clearance.map(ActivityLogClearance::getClearedByName).orElse(null),
                    canClear);
        }).toList();
    }

    @Transactional
    public void clearMonth(Long businessId, int year, int month, String clearedByName) {
        if (clearanceRepository.findByBusinessIdAndYearAndMonth(businessId, year, month).isPresent()) {
            throw new RuntimeException("That month has already been cleared");
        }
        LocalDateTime clearableFrom = LocalDateTime.of(year, month, 1, 0, 0)
                .plusMonths(1).plusDays(REVIEW_WINDOW_DAYS);
        if (LocalDateTime.now().isBefore(clearableFrom)) {
            throw new RuntimeException("This month isn't eligible to clear yet — it stays visible for "
                    + REVIEW_WINDOW_DAYS + " days after the month ends");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        ActivityLogClearance clearance = new ActivityLogClearance();
        clearance.setBusiness(business);
        clearance.setYear(year);
        clearance.setMonth(month);
        clearance.setClearedByName(clearedByName);
        clearanceRepository.save(clearance);
    }
}
