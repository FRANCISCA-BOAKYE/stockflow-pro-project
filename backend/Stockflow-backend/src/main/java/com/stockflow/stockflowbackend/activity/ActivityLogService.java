package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.dto.ActivityLogResponse;
import com.stockflow.stockflowbackend.dto.ActivityMonthResponse;
import com.stockflow.stockflowbackend.email.EmailSenderService;
import com.stockflow.stockflowbackend.email.EmailTemplateUtil;
import com.stockflow.stockflowbackend.model.ActivityLog;
import com.stockflow.stockflowbackend.model.ActivityLogClearance;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
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
    private final UserRepository userRepository;
    private final EmailSenderService emailSenderService;

    public ActivityLogService(ActivityLogRepository activityLogRepository,
                              ActivityLogClearanceRepository clearanceRepository,
                              BusinessRepository businessRepository,
                              UserRepository userRepository,
                              EmailSenderService emailSenderService) {
        this.activityLogRepository = activityLogRepository;
        this.clearanceRepository = clearanceRepository;
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.emailSenderService = emailSenderService;
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
            boolean alreadyCleared = clearance.map(c -> c.getClearedAt() != null).orElse(false);
            boolean canClear = !alreadyCleared && now.isAfter(clearableFrom);

            String label = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year;

            return new ActivityMonthResponse(
                    year, month, label, row.getEntryCount(),
                    clearance.map(ActivityLogClearance::getClearedAt).orElse(null),
                    clearance.map(ActivityLogClearance::getClearedByName).orElse(null),
                    clearance.map(ActivityLogClearance::getSummaryEmailedAt).orElse(null),
                    canClear);
        }).toList();
    }

    @Transactional
    public void clearMonth(Long businessId, int year, int month, String clearedByName) {
        ActivityLogClearance clearance = clearanceRepository
                .findByBusinessIdAndYearAndMonth(businessId, year, month).orElse(null);
        if (clearance != null && clearance.getClearedAt() != null) {
            throw new RuntimeException("That month has already been cleared");
        }
        LocalDateTime clearableFrom = LocalDateTime.of(year, month, 1, 0, 0)
                .plusMonths(1).plusDays(REVIEW_WINDOW_DAYS);
        if (LocalDateTime.now().isBefore(clearableFrom)) {
            throw new RuntimeException("This month isn't eligible to clear yet — it stays visible for "
                    + REVIEW_WINDOW_DAYS + " days after the month ends");
        }

        // May already exist if the monthly summary email already went out for
        // this month — reuse that row (unique on business/year/month) instead
        // of inserting a second one.
        if (clearance == null) {
            Business business = businessRepository.findById(businessId)
                    .orElseThrow(() -> new RuntimeException("Business not found"));
            clearance = new ActivityLogClearance();
            clearance.setBusiness(business);
            clearance.setYear(year);
            clearance.setMonth(month);
        }
        clearance.setClearedAt(LocalDateTime.now());
        clearance.setClearedByName(clearedByName);
        clearanceRepository.save(clearance);
    }

    /**
     * Sends the owner a summary email for any month that's fully ended but
     * hasn't been emailed yet — so a record survives in their inbox even after
     * they clear it from the in-app view. Runs daily; a month only needs this
     * once, so most days this is a no-op for most businesses.
     */
    @Transactional
    @Scheduled(cron = "0 0 8 * * *")
    public void emailPendingMonthlySummaries() {
        for (Business business : businessRepository.findAll()) {
            for (ActivityLogRepository.MonthlyCount row : activityLogRepository.countByMonth(business.getId())) {
                emailSummaryIfDue(business, row.getYear(), row.getMonth(), row.getEntryCount());
            }
        }
    }

    private void emailSummaryIfDue(Business business, int year, int month, long entryCount) {
        LocalDateTime monthEnd = LocalDateTime.of(year, month, 1, 0, 0).plusMonths(1);
        if (LocalDateTime.now().isBefore(monthEnd)) {
            return; // still the current month — don't email a month that's still accumulating activity
        }

        ActivityLogClearance clearance = clearanceRepository
                .findByBusinessIdAndYearAndMonth(business.getId(), year, month).orElse(null);
        if (clearance != null && clearance.getSummaryEmailedAt() != null) {
            return; // already sent
        }

        Optional<AppUser> owner = userRepository.findFirstByBusiness_IdAndIsSubAccountFalse(business.getId());
        if (owner.isEmpty() || owner.get().getEmail() == null) {
            return;
        }

        String label = Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + year;
        List<ActivityLog> entries = activityLogRepository.findByBusinessIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                business.getId(), LocalDateTime.of(year, month, 1, 0, 0), monthEnd,
                PageRequest.of(0, 200, Sort.by("createdAt").descending())).getContent();

        try {
            emailSenderService.sendAsync(owner.get().getEmail(),
                    label + " activity summary — " + business.getName(),
                    buildSummaryEmailHtml(business, label, entryCount, entries));
        } catch (Exception e) {
            log.warn("Failed to send monthly activity summary for business {}: {}", business.getId(), e.getMessage());
            return;
        }

        if (clearance == null) {
            clearance = new ActivityLogClearance();
            clearance.setBusiness(business);
            clearance.setYear(year);
            clearance.setMonth(month);
        }
        clearance.setSummaryEmailedAt(LocalDateTime.now());
        clearanceRepository.save(clearance);
    }

    private String buildSummaryEmailHtml(Business business, String label, long entryCount, List<ActivityLog> entries) {
        StringBuilder rows = new StringBuilder();
        for (ActivityLog e : entries) {
            String amount = e.getAmountUsd() != null ? " — $" + e.getAmountUsd() : "";
            rows.append("<tr style=\"border-bottom: 1px solid #f1f5f9;\">")
                    .append("<td style=\"padding: 8px 0; font-size: 13px; color: #374151;\">")
                    .append(e.getDescription()).append(amount).append("</td>")
                    .append("<td style=\"padding: 8px 0; font-size: 12px; color: #94a3b8; text-align: right;\">")
                    .append(e.getActorName()).append(" · ").append(e.getCreatedAt().toLocalDate()).append("</td>")
                    .append("</tr>");
        }
        String moreNote = entryCount > entries.size()
                ? EmailTemplateUtil.smallNote("Showing the most recent " + entries.size() + " of " + entryCount
                        + " activities. Full history is always kept — contact support if you ever need the rest retrieved.")
                : "";

        return EmailTemplateUtil.wrap(
                label + " activity summary",
                business.getName(),
                EmailTemplateUtil.paragraph(entryCount + " activit" + (entryCount == 1 ? "y" : "ies") + " recorded this month.")
                        + "<table style=\"width: 100%; border-collapse: collapse; margin: 12px 0;\">" + rows + "</table>"
                        + moreNote
                        + EmailTemplateUtil.smallNote("This is a permanent record for your files — clearing this month in the app only hides it from the in-app view, it never deletes anything."));
    }
}
