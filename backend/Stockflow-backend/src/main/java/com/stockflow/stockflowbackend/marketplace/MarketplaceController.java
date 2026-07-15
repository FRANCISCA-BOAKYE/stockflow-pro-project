package com.stockflow.stockflowbackend.marketplace;

import com.stockflow.stockflowbackend.dto.CreateListingRequest;
import com.stockflow.stockflowbackend.model.Listing;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/marketplace")
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    public MarketplaceController(MarketplaceService marketplaceService) {
        this.marketplaceService = marketplaceService;
    }

    @GetMapping("/listings")
    public ResponseEntity<List<Listing>> getListings(
            @RequestParam(required = false) String tierType) {
        return ResponseEntity.ok(
            marketplaceService.getListings(tierType));
    }

    @PostMapping("/listing")
    public ResponseEntity<Listing> createListing(
            @RequestBody CreateListingRequest req,
            Authentication auth) {
        return ResponseEntity.ok(marketplaceService.createOrUpdateListing(
            req, (Long) auth.getDetails()));
    }

    @GetMapping("/my-listing")
    public ResponseEntity<?> getMyListing(Authentication auth) {
        return marketplaceService.getMyListing((Long) auth.getDetails())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of("exists", false)));
    }
}