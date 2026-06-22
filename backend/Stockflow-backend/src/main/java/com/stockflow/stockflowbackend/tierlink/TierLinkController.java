package com.stockflow.stockflowbackend.tierlink;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.TierLink;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/links")
public class TierLinkController {

    private final TierLinkService tierLinkService;

    public TierLinkController(TierLinkService tierLinkService) {
        this.tierLinkService = tierLinkService;
    }

    private Long getBusinessId(Authentication auth) {
        return (Long) auth.getDetails();
    }

    @PostMapping("/request")
    public ResponseEntity<TierLink> request(
            @RequestBody LinkRequest req, Authentication auth) {
        return ResponseEntity.ok(
            tierLinkService.sendRequest(req, getBusinessId(auth)));
    }

    @PostMapping("/accept")
    public ResponseEntity<TierLink> accept(
            @RequestBody AcceptLinkRequest req) {
        return ResponseEntity.ok(tierLinkService.acceptRequest(req));
    }

    @GetMapping("/partners")
    public ResponseEntity<List<TierLink>> partners(Authentication auth) {
        return ResponseEntity.ok(
            tierLinkService.getPartners(getBusinessId(auth)));
    }
}
