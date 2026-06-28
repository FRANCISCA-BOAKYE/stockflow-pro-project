package com.stockflow.stockflowbackend.marketplace;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.CreateListingRequest;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Listing;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MarketplaceService {

    private final ListingRepository listingRepository;
    private final BusinessRepository businessRepository;

    public MarketplaceService(ListingRepository listingRepository,
            BusinessRepository businessRepository) {
        this.listingRepository = listingRepository;
        this.businessRepository = businessRepository;
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