package com.stockflow.stockflowbackend.geo;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Canonical country/currency catalog — single source of truth for which
 * countries a business can select, their display currency, and whether card
 * payments actually work there.
 *
 * Scope note: this only lists countries Paystack itself operates in — Paystack
 * has no presence outside these markets, so "supporting" a country beyond this
 * list would require an entirely different payment processor, not just a new
 * entry here. Only Ghana has a live, verified Paystack account behind it today;
 * the rest are wired for display/cash/mobile-money and marked "coming soon" for
 * card payments until a real merchant account exists for them.
 *
 * usdRate values are approximate, static conversion rates for display purposes
 * only (not a live FX feed) — same simplification the app already made for the
 * original hardcoded USD_TO_GHS constant.
 */
public final class CountryCatalog {

    public static final String DEFAULT_COUNTRY = "GH";

    private static final Map<String, Country> COUNTRIES = new LinkedHashMap<>();

    static {
        register(new Country("GH", "Ghana", "GHS", "GH₵", 15.0, true));
        register(new Country("NG", "Nigeria", "NGN", "₦", 1550.0, false));
        register(new Country("ZA", "South Africa", "ZAR", "R", 18.5, false));
        register(new Country("KE", "Kenya", "KES", "KSh", 129.0, false));
        register(new Country("CI", "Côte d'Ivoire", "XOF", "CFA", 610.0, false));
        register(new Country("EG", "Egypt", "EGP", "E£", 49.0, false));
        register(new Country("RW", "Rwanda", "RWF", "RF", 1300.0, false));
    }

    private static void register(Country c) {
        COUNTRIES.put(c.code(), c);
    }

    private CountryCatalog() {}

    public static Map<String, Country> all() {
        return COUNTRIES;
    }

    public static Country get(String code) {
        return COUNTRIES.getOrDefault(code, COUNTRIES.get(DEFAULT_COUNTRY));
    }

    public static boolean isSupported(String code) {
        return code != null && COUNTRIES.containsKey(code);
    }

    public static boolean isPaystackLive(String code) {
        return get(code).paystackLive();
    }
}
