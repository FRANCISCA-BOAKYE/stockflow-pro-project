package com.stockflow.stockflowbackend.payment;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.VerifyPaymentRequest;
import com.stockflow.stockflowbackend.dto.VerifyPaymentResponse;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.subscription.PlanCatalog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class PaystackVerifyService {

    private final BusinessRepository businessRepository;

    @Value("${paystack.secret.key}")
    private String paystackSecret;

    public PaystackVerifyService(BusinessRepository businessRepository) {
        this.businessRepository = businessRepository;
    }

    @Transactional
    public VerifyPaymentResponse verifyAndActivate(Long businessId, VerifyPaymentRequest req) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        if (req.getReference() == null || req.getReference().isBlank()) {
            return new VerifyPaymentResponse(false, "Missing payment reference",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }

        Map<String, Object> body;
        try {
            body = RestClient.create()
                    .get()
                    .uri("https://api.paystack.co/transaction/verify/{reference}", req.getReference())
                    .header("Authorization", "Bearer " + paystackSecret)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            return new VerifyPaymentResponse(false, "Could not reach Paystack to verify this payment",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }

        if (body == null || !Boolean.TRUE.equals(body.get("status"))) {
            return new VerifyPaymentResponse(false, "Payment verification failed",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }

        Object dataObj = body.get("data");
        if (!(dataObj instanceof Map)) {
            return new VerifyPaymentResponse(false, "Unexpected response from Paystack",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) dataObj;

        if (!"success".equals(data.get("status"))) {
            return new VerifyPaymentResponse(false, "This transaction was not successful",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }

        String plan = PlanCatalog.isValidPlan(req.getPlan()) ? req.getPlan() : business.getSubscriptionPlan();
        int paidPesewas = data.get("amount") instanceof Number n ? n.intValue() : 0;
        int expectedPesewas = PlanCatalog.priceGhs(business.getTierType(), plan) * 100;

        if (paidPesewas < expectedPesewas - 100) {
            return new VerifyPaymentResponse(false, "Amount paid does not match the selected plan price",
                    business.getSubscriptionStatus(), business.getSubscriptionPlan());
        }

        business.setSubscriptionPlan(plan);
        business.setSubscriptionStatus("ACTIVE");
        businessRepository.save(business);

        return new VerifyPaymentResponse(true, "Subscription activated", "ACTIVE", plan);
    }
}
