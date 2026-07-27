package com.stockflow.stockflowbackend.payment;

import com.stockflow.stockflowbackend.geo.CurrencyRateService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Server-side confirmation that a CARD sale/dispatch was actually paid via
 * Paystack, rather than trusting the client-side "success" callback alone.
 * Mirrors the check already used for subscription payments.
 */
@Service
public class PaystackTransactionVerifier {

    private final CurrencyRateService currencyRateService;

    @Value("${paystack.secret.key}")
    private String paystackSecret;

    public PaystackTransactionVerifier(CurrencyRateService currencyRateService) {
        this.currencyRateService = currencyRateService;
    }

    /** Throws if the reference is missing, unverifiable, not successful, or short-paid. */
    public void verifyPaid(String reference, BigDecimal expectedAmountUsd) {
        if (reference == null || reference.isBlank()) {
            throw new RuntimeException("Card payment reference is missing");
        }

        Map<String, Object> body;
        try {
            body = RestClient.create()
                    .get()
                    .uri("https://api.paystack.co/transaction/verify/{reference}", reference)
                    .header("Authorization", "Bearer " + paystackSecret)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Could not reach Paystack to verify this payment");
        }

        if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
            throw new RuntimeException("Payment verification failed");
        }

        Object dataObj = body.get("data");
        if (!(dataObj instanceof Map)) {
            throw new RuntimeException("Unexpected response from Paystack");
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) dataObj;

        if (!"success".equals(data.get("status"))) {
            throw new RuntimeException("This card payment was not successful");
        }

        // CARD payments are gated to Ghana only today (see CountryCatalog), so this
        // always verifies against the GHS rate; revisit if another country goes live.
        double usdToGhs = currencyRateService.getRate("GH");
        int paidPesewas = data.get("amount") instanceof Number n ? n.intValue() : 0;
        int expectedPesewas = expectedAmountUsd.multiply(BigDecimal.valueOf(usdToGhs))
                .multiply(BigDecimal.valueOf(100)).intValue();

        // Small tolerance for rounding between the client's USD->GHS conversion and this check
        if (paidPesewas < expectedPesewas - 100) {
            throw new RuntimeException("Amount paid does not match the sale total");
        }
    }
}
