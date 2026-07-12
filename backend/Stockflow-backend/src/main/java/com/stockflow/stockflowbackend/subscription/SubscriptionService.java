package com.stockflow.stockflowbackend.subscription;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.model.Business;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@Service
public class SubscriptionService {

    private final BusinessRepository businessRepository;

    public SubscriptionService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @Transactional
    public Business refreshSubscription(Business business) {
        if (business == null) {
            throw new RuntimeException("Business not found");
        }
        if ("ACTIVE".equals(business.getSubscriptionStatus())) {
            return business;
        }
        if ("TRIAL".equals(business.getSubscriptionStatus())
                && business.getTrialStartedAt() != null) {
            long days = ChronoUnit.DAYS.between(
                    business.getTrialStartedAt(), LocalDateTime.now());
            if (days >= PlanCatalog.TRIAL_DAYS) {
                business.setSubscriptionStatus("EXPIRED");
                businessRepository.save(business);
            }
        }
        return business;
    }

    @Transactional
    public Business startTrialOnFirstAccess(Business business) {
        if ("TRIAL".equals(business.getSubscriptionStatus())
                && business.getTrialStartedAt() == null) {
            business.setTrialStartedAt(LocalDateTime.now());
            businessRepository.save(business);
        }
        return business;
    }

    @Transactional(readOnly = true)
    public Business loadAndRefresh(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        return refreshSubscription(business);
    }

    public void requireActiveSubscription(Business business) {
        refreshSubscription(business);
        if ("EXPIRED".equals(business.getSubscriptionStatus())) {
            throw new RuntimeException(
                    "Subscription expired. Please subscribe to continue.");
        }
    }

    public boolean hasPremiumPlan(Business business) {
        return "PREMIUM".equals(business.getSubscriptionPlan());
    }

    public boolean hasFeature(Business business, SubscriptionFeature feature) {
        if ("EXPIRED".equals(business.getSubscriptionStatus())) {
            return false;
        }
        if ("TRIAL".equals(business.getSubscriptionStatus())
                || "ACTIVE".equals(business.getSubscriptionStatus())) {
            if (hasPremiumPlan(business)) {
                return true;
            }
            Set<SubscriptionFeature> premiumOnly = PlanCatalog.PREMIUM_FEATURES
                    .getOrDefault(business.getTierType(), Set.of());
            return !premiumOnly.contains(feature);
        }
        return false;
    }

    public void requireFeature(Business business, SubscriptionFeature feature) {
        requireActiveSubscription(business);
        if (!hasFeature(business, feature)) {
            throw new RuntimeException(
                    feature.name() + " requires a Premium subscription");
        }
    }

    public int maxSubAccounts(Business business) {
        return PlanCatalog.maxSubAccounts(
                business.getTierType(), business.getSubscriptionPlan());
    }

    public Map<String, Object> buildPlansCatalog() {
        Map<String, Object> catalog = new LinkedHashMap<>();
        catalog.put("trialDays", PlanCatalog.TRIAL_DAYS);
        catalog.put("currencyDisplay", "USD");
        catalog.put("paystackCurrency", "GHS");
        catalog.put("usdToGhsRate", PlanCatalog.USD_TO_GHS);
        catalog.put("subAccountLimits", PlanCatalog.SUB_ACCOUNT_LIMITS);
        catalog.put("monthlyPriceUsd", PlanCatalog.MONTHLY_PRICE_USD);
        catalog.put("premiumFeatures", PlanCatalog.PREMIUM_FEATURES);
        return catalog;
    }
}
