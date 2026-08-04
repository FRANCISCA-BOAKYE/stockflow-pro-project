package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.dto.ActivityLogResponse;
import com.stockflow.stockflowbackend.dto.ActivityMonthResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/activity-log")
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    private Long getBusinessId(Authentication auth) {
        return (Long) auth.getDetails();
    }

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    private boolean isSubAccount(Authentication auth) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_SUB_ACCOUNT".equals(a.getAuthority()));
    }

    @GetMapping
    public ResponseEntity<Page<ActivityLogResponse>> list(
            @RequestParam(required = false) Long actorId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            Authentication auth) {
        // A sub-account can only ever see their own activity, never the whole team's —
        // the owner-visibility of everyone else's actions is the point of this feature.
        Long effectiveActorId = isSubAccount(auth) ? getUserId(auth) : actorId;
        return ResponseEntity.ok(activityLogService.list(
                getBusinessId(auth), effectiveActorId, year, month, page, size));
    }

    /** Owner-only monthly review view — never exposed to sub-accounts. */
    @GetMapping("/months")
    public ResponseEntity<List<ActivityMonthResponse>> listMonths(Authentication auth) {
        if (isSubAccount(auth)) {
            throw new RuntimeException("Unauthorized: only the business owner can review monthly activity");
        }
        return ResponseEntity.ok(activityLogService.listMonths(getBusinessId(auth)));
    }

    /**
     * Declutters a fully-reviewed month from the default view. Purely additive —
     * never deletes or touches the underlying activity_logs rows, so the full
     * history is always recoverable (e.g. via support) if something looks wrong later.
     */
    @PostMapping("/months/clear")
    public ResponseEntity<Map<String, Object>> clearMonth(
            @RequestBody Map<String, Integer> req,
            Authentication auth) {
        if (isSubAccount(auth)) {
            throw new RuntimeException("Unauthorized: only the business owner can clear reviewed activity");
        }
        activityLogService.clearMonth(getBusinessId(auth), req.get("year"), req.get("month"), auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }
}
