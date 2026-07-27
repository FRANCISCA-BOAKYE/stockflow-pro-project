package com.stockflow.stockflowbackend.geo;

public record Country(
        String code,
        String name,
        String currencyCode,
        String currencySymbol,
        double usdRate,
        boolean paystackLive
) {
}
