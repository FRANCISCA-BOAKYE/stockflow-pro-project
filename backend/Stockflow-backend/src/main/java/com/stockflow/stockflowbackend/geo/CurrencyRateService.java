package com.stockflow.stockflowbackend.geo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import jakarta.annotation.PostConstruct;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Live USD exchange rates for every currency in CountryCatalog, with the
 * static catalog rates as a permanent fallback. A failed or slow fetch never
 * breaks the app — it just leaves the last known good rate (or the static
 * default) in place. This is the single source of truth for "what's the
 * current USD rate for country X" — both the /auth/countries response the
 * mobile app reads and PaystackTransactionVerifier's payment-amount check
 * pull from here, so display and actual charge verification never drift
 * apart from each other.
 */
@Service
public class CurrencyRateService {

    private static final Logger log = LoggerFactory.getLogger(CurrencyRateService.class);
    private static final String FX_API_URL = "https://open.er-api.com/v6/latest/USD";

    private final Map<String, Double> liveRatesByCurrency = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        refresh();
    }

    /** Every 6 hours — exchange rates don't move fast enough to need more than this. */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000)
    public void refresh() {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = RestClient.create()
                    .get()
                    .uri(FX_API_URL)
                    .retrieve()
                    .body(Map.class);

            if (body == null || !"success".equals(body.get("result"))) {
                log.warn("FX rate refresh: unexpected response, keeping existing rates");
                return;
            }
            Object ratesObj = body.get("rates");
            if (!(ratesObj instanceof Map)) {
                log.warn("FX rate refresh: no rates in response, keeping existing rates");
                return;
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> rates = (Map<String, Object>) ratesObj;

            int updated = 0;
            for (Country country : CountryCatalog.all().values()) {
                Object rateObj = rates.get(country.currencyCode());
                if (rateObj instanceof Number n) {
                    liveRatesByCurrency.put(country.currencyCode(), n.doubleValue());
                    updated++;
                }
            }
            log.info("FX rate refresh: updated {} currencies from live feed", updated);
        } catch (Exception e) {
            log.warn("FX rate refresh failed, keeping existing/default rates: {}", e.getMessage());
        }
    }

    /** The current best-known USD rate for a country — live if we have it, static default otherwise. */
    public double getRate(String countryCode) {
        Country country = CountryCatalog.get(countryCode);
        return liveRatesByCurrency.getOrDefault(country.currencyCode(), country.usdRate());
    }

    /** Same catalog, with each entry's usdRate replaced by the current live-or-default rate. */
    public Map<String, Country> effectiveCatalog() {
        Map<String, Country> result = new ConcurrentHashMap<>();
        for (Country c : CountryCatalog.all().values()) {
            result.put(c.code(), new Country(c.code(), c.name(), c.currencyCode(), c.currencySymbol(), getRate(c.code()), c.paystackLive()));
        }
        return result;
    }
}
