package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.dto.ActivityLogResponse;
import com.stockflow.stockflowbackend.model.ActivityLog;
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

@Service
public class ActivityLogService {

    private static final Logger log = LoggerFactory.getLogger(ActivityLogService.class);

    private final ActivityLogRepository activityLogRepository;

    public ActivityLogService(ActivityLogRepository activityLogRepository) {
        this.activityLogRepository = activityLogRepository;
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
        PageRequest pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ActivityLog> entries = actorId != null
                ? activityLogRepository.findByBusinessIdAndActorIdOrderByCreatedAtDesc(businessId, actorId, pageable)
                : activityLogRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
        return entries.map(e -> new ActivityLogResponse(
                e.getId(), e.getActorName(), e.getActorIsSubAccount(), e.getActionType(),
                e.getDescription(), e.getAmountUsd(), e.getCreatedAt()));
    }
}
