package com.stockflow.stockflowbackend.reservation;

import com.stockflow.stockflowbackend.dto.AvailableStockResponse;
import com.stockflow.stockflowbackend.dto.CreateReservationRequest;
import com.stockflow.stockflowbackend.dto.ReservationListItem;
import com.stockflow.stockflowbackend.dto.ReservationResponse;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.subscription.AccessControlService;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reserve")
public class ReservationController {

    private final ReservationService reservationService;
    private final AccessControlService accessControlService;

    public ReservationController(ReservationService reservationService,
                                 AccessControlService accessControlService) {
        this.reservationService = reservationService;
        this.accessControlService = accessControlService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    private Long getUserId(Authentication authentication) {
        return (Long) authentication.getCredentials();
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> create(
            @RequestBody CreateReservationRequest request,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        Business business = accessControlService.requireBusiness(businessId);
        accessControlService.requireFeature(business, SubscriptionFeature.STOCK_RESERVATION);
        return ResponseEntity.ok(
                reservationService.createReservation(request, businessId, getUserId(authentication)));
    }

    @GetMapping
    public ResponseEntity<List<ReservationListItem>> mine(Authentication authentication) {
        return ResponseEntity.ok(
                reservationService.getActiveReservations(getBusinessId(authentication)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> release(@PathVariable Long id, Authentication authentication) {
        reservationService.releaseReservation(id, getBusinessId(authentication));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/available")
    public ResponseEntity<AvailableStockResponse> available(
            @RequestParam Long productId,
            @RequestParam String productType,
            Authentication authentication) {
        return ResponseEntity.ok(reservationService.getAvailableStock(
                productId, productType, getBusinessId(authentication)));
    }
}