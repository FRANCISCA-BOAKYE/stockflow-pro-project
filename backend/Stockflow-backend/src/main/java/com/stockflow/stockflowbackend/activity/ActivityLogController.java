package com.stockflow.stockflowbackend.activity;

import com.stockflow.stockflowbackend.dto.ActivityLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            Authentication auth) {
        // A sub-account can only ever see their own activity, never the whole team's —
        // the owner-visibility of everyone else's actions is the point of this feature.
        Long effectiveActorId = isSubAccount(auth) ? getUserId(auth) : actorId;
        return ResponseEntity.ok(activityLogService.list(
                getBusinessId(auth), effectiveActorId, page, size));
    }
}
