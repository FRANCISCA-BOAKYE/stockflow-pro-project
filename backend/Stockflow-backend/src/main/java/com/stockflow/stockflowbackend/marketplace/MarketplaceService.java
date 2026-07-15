package com.stockflow.stockflowbackend.marketplace;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.CreateListingRequest;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Listing;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class MarketplaceService {

    private final ListingRepository listingRepository;
    private final BusinessRepository businessRepository;
    private final SubscriptionService subscriptionService;

    public MarketplaceService(ListingRepository listingRepository,
            BusinessRepository businessRepository,
            SubscriptionService subscriptionService) {
        this.listingRepository = listingRepository;
        this.businessRepository = businessRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional(readOnly = true)
    public Optional<Listing> getMyListing(Long businessId) {
        return listingRepository.findByBusinessId(businessId);
    }

    @Transactional(readOnly = true)
    public List<Listing> getListings(String tierType) {
        if (tierType != null && !tierType.isEmpty()) {
            return listingRepository
                .findByIsActiveTrueAndTierTypeOrderByUpdatedAtDesc(tierType);
        }
        return listingRepository.findByIsActiveTrueOrderByUpdatedAtDesc();
    }

    @Transactional
    public Listing createOrUpdateListing(
            CreateListingRequest req, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        subscriptionService.requireFeature(business, SubscriptionFeature.MARKETPLACE_LISTING);

        Listing listing = listingRepository.findByBusinessId(businessId)
                .orElseGet(Listing::new);

        listing.setBusiness(business);
        listing.setTierType(business.getTierType());
        listing.setHeadline(req.getHeadline());
        listing.setDescription(req.getDescription());
        listing.setDeliveryTerms(req.getDeliveryTerms());
        listing.setCreditTerms(req.getCreditTerms());
        listing.setLocation(req.getLocation());
        listing.setContactEmail(req.getContactEmail());
        listing.setContactPhone(req.getContactPhone());
        listing.setIsActive(true);
        listing.setUpdatedAt(LocalDateTime.now());

        return listingRepository.save(listing);
    }
}