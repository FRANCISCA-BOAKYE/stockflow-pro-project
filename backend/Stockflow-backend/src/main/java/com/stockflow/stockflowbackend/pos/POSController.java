package com.stockflow.stockflowbackend.pos;

import com.stockflow.stockflowbackend.dto.POSRequest;
import com.stockflow.stockflowbackend.dto.POSResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pos")
public class POSController {

    private final POSService posService;

    public POSController(POSService posService) {
        this.posService = posService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping("/retail")
    public ResponseEntity<POSResponse> retailSale(
            @RequestBody POSRequest request,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        return ResponseEntity.ok(
                posService.processRetailSale(request, businessId, businessId));
    }
}