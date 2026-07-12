package com.stockflow.stockflowbackend.subscription;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.model.Business;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccessControlService {

    private final BusinessRepository businessRepository;
    private final SubscriptionService subscriptionService;

    public AccessControlService(BusinessRepository businessRepository,
                                SubscriptionService subscriptionService) {
        this.businessRepository = businessRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional
    public Business requireBusiness(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        subscriptionService.startTrialOnFirstAccess(business);
        subscriptionService.refreshSubscription(business);
        subscriptionService.requireActiveSubscription(business);
        return business;
    }

    @Transactional
    public Business requireBusinessTier(Long businessId, String... allowedTiers) {
        Business business = requireBusiness(businessId);
        for (String tier : allowedTiers) {
            if (tier.equals(business.getTierType())) {
                return business;
            }
        }
        throw new RuntimeException(
                "This action is not available for " + business.getTierType()
                        + " accounts");
    }

    public void requireFeature(Business business, SubscriptionFeature feature) {
        subscriptionService.requireFeature(business, feature);
    }
}
