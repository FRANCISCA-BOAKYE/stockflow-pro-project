package com.stockflow.stockflowbackend.subscription;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.notification.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SubscriptionService {

    private static final int TRIAL_ENDING_WARNING_DAYS = 3;

    private final BusinessRepository businessRepository;
    private final NotificationService notificationService;

    public SubscriptionService(BusinessRepository businessRepository,
                               NotificationService notificationService) {
        this.businessRepository = businessRepository;
        this.notificationService = notificationService;
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

    @Scheduled(fixedRate = 12 * 60 * 60 * 1000)
    @Transactional
    public void checkTrialExpirations() {
        List<Business> trialBusinesses = businessRepository.findBySubscriptionStatus("TRIAL");
        for (Business business : trialBusinesses) {
            if (business.getTrialStartedAt() == null) {
                continue;
            }
            long days = ChronoUnit.DAYS.between(business.getTrialStartedAt(), LocalDateTime.now());
            long daysLeft = PlanCatalog.TRIAL_DAYS - days;

            if (daysLeft <= 0) {
                business.setSubscriptionStatus("EXPIRED");
                businessRepository.save(business);
                notificationService.notify(business, "TRIAL_EXPIRED", "error",
                        "Trial expired",
                        "Your " + PlanCatalog.TRIAL_DAYS + "-day trial has ended. Subscribe to keep using StockFlow Pro.");
            } else if (daysLeft <= TRIAL_ENDING_WARNING_DAYS) {
                notificationService.notifyOnce(business, "TRIAL_ENDING", "warning",
                        "Trial ending soon",
                        "Your trial ends in " + daysLeft + " day" + (daysLeft == 1 ? "" : "s") + ". Subscribe to avoid losing access.",
                        LocalDateTime.now().minusHours(24));
            }
        }
    }
}
