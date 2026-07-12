package com.stockflow.stockflowbackend.subscription;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Canonical subscription catalog — single source of truth for tiers, plans,
 * limits, prices, and premium-only features.
 */
public final class PlanCatalog {

    public static final int TRIAL_DAYS = 14;

    public static final Map<String, Map<String, Integer>> SUB_ACCOUNT_LIMITS = Map.of(
            "RETAILER", Map.of("STANDARD", 2, "PREMIUM", 5),
            "WHOLESALER", Map.of("STANDARD", 6, "PREMIUM", 8),
            "MANUFACTURER", Map.of("STANDARD", 5, "PREMIUM", 10)
    );

    public static final Map<String, Map<String, Integer>> MONTHLY_PRICE_USD = Map.of(
            "RETAILER", Map.of("STANDARD", 17, "PREMIUM", 30),
            "WHOLESALER", Map.of("STANDARD", 45, "PREMIUM", 75),
            "MANUFACTURER", Map.of("STANDARD", 80, "PREMIUM", 110)
    );

    /** Paystack charges in GHS; approximate USD × rate for Ghana market. */
    public static final double USD_TO_GHS = 15.0;

    public static final Set<String> VALID_TIERS = Set.of(
            "RETAILER", "WHOLESALER", "MANUFACTURER");
    public static final Set<String> VALID_PLANS = Set.of("STANDARD", "PREMIUM");

    /**
     * Features included only on PREMIUM (TRIAL gets plan selected at signup).
     * Only lists features that are actually enforced in code — CUSTOMER_HISTORY,
     * AUTO_REORDER, ADVANCED_REPORTS, DELIVERY_SCHEDULING, and INVOICE_GENERATION
     * have no distinct basic/advanced implementation to gate against, so they are
     * intentionally left out here rather than advertised as a paid benefit.
     */
    public static final Map<String, Set<SubscriptionFeature>> PREMIUM_FEATURES = Map.of(
            "RETAILER", Set.of(
                    SubscriptionFeature.STOCK_RESERVATION
            ),
            "WHOLESALER", Set.of(
                    SubscriptionFeature.INVOICE_DELIVERY
            ),
            "MANUFACTURER", Set.of(
                    SubscriptionFeature.INVOICE_DELIVERY
            )
    );

    public static final List<String> ALLOWED_LINK_PAIRS = List.of(
            "MANUFACTURER:WHOLESALER",
            "WHOLESALER:MANUFACTURER",
            "WHOLESALER:RETAILER",
            "RETAILER:WHOLESALER"
    );

    private PlanCatalog() {}

    public static int maxSubAccounts(String tierType, String plan) {
        return SUB_ACCOUNT_LIMITS
                .getOrDefault(tierType, SUB_ACCOUNT_LIMITS.get("RETAILER"))
                .getOrDefault(plan, 2);
    }

    public static int priceUsd(String tierType, String plan) {
        return MONTHLY_PRICE_USD
                .getOrDefault(tierType, MONTHLY_PRICE_USD.get("RETAILER"))
                .getOrDefault(plan, 17);
    }

    public static int priceGhs(String tierType, String plan) {
        return (int) Math.round(priceUsd(tierType, plan) * USD_TO_GHS);
    }

    public static boolean isValidTier(String tierType) {
        return tierType != null && VALID_TIERS.contains(tierType);
    }

    public static boolean isValidPlan(String plan) {
        return plan != null && VALID_PLANS.contains(plan);
    }

    public static boolean isAllowedLink(String requesterTier, String partnerTier) {
        return ALLOWED_LINK_PAIRS.contains(requesterTier + ":" + partnerTier);
    }
}
