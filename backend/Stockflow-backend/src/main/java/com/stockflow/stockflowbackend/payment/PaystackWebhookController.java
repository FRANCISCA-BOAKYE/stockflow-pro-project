package com.stockflow.stockflowbackend.payment;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.dto.VerifyPaymentRequest;
import com.stockflow.stockflowbackend.dto.VerifyPaymentResponse;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.subscription.PlanCatalog;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/payments")
public class PaystackWebhookController {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final PaystackVerifyService paystackVerifyService;

    @Value("${paystack.secret.key}")
    private String paystackSecret;

    public PaystackWebhookController(
            BusinessRepository businessRepository,
            UserRepository userRepository,
            PaystackVerifyService paystackVerifyService) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
        this.paystackVerifyService = paystackVerifyService;
    }

    @PostMapping("/verify")
    public ResponseEntity<VerifyPaymentResponse> verify(
            @RequestBody VerifyPaymentRequest req, Authentication auth) {
        Long businessId = (Long) auth.getDetails();
        VerifyPaymentResponse response = paystackVerifyService.verifyAndActivate(businessId, req);
        return response.isVerified() ? ResponseEntity.ok(response) : ResponseEntity.status(402).body(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(value = "x-paystack-signature", required = false) String signature,
            @RequestBody String rawBody) {

        if (signature == null || !verifySignature(rawBody, signature)) {
            return ResponseEntity.status(401).body("Invalid signature");
        }

        try {
            String event = extractField(rawBody, "event");
            if (!"charge.success".equals(event)) {
                return ResponseEntity.ok("Ignored event: " + event);
            }

            String email = extractField(rawBody, "email");
            Long paidPesewas = extractNumericField(rawBody, "amount");
            if (email != null) {
                Optional<AppUser> userOpt = userRepository.findByEmail(email);
                if (userOpt.isPresent()) {
                    AppUser user = userOpt.get();
                    Optional<Business> bizOpt = businessRepository.findById(
                            user.getBusiness().getId());
                    if (bizOpt.isPresent()) {
                        Business business = bizOpt.get();
                        String matchedPlan = matchPlanByAmount(business.getTierType(), paidPesewas);
                        // Only activate if the amount actually charged matches a real plan
                        // price for this business's tier — otherwise any successful charge
                        // tied to the user's email (even an unrelated small one) would
                        // silently grant a paid subscription for free.
                        if (matchedPlan != null) {
                            business.setSubscriptionPlan(matchedPlan);
                            business.setSubscriptionStatus("ACTIVE");
                            businessRepository.save(business);
                        }
                    }
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error: " + e.getMessage());
        }

        return ResponseEntity.ok("OK");
    }

    private String extractField(String rawBody, String fieldName) {
        try {
            String needle = "\"" + fieldName + "\"";
            int idx = rawBody.indexOf(needle);
            if (idx == -1) return null;
            int start = rawBody.indexOf("\"", idx + needle.length()) + 1;
            int end = rawBody.indexOf("\"", start);
            return rawBody.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }

    private Long extractNumericField(String rawBody, String fieldName) {
        try {
            String needle = "\"" + fieldName + "\"";
            int idx = rawBody.indexOf(needle);
            if (idx == -1) return null;
            int colonIdx = rawBody.indexOf(":", idx + needle.length());
            if (colonIdx == -1) return null;
            int start = colonIdx + 1;
            while (start < rawBody.length() && Character.isWhitespace(rawBody.charAt(start))) start++;
            int end = start;
            while (end < rawBody.length() && Character.isDigit(rawBody.charAt(end))) end++;
            if (end == start) return null;
            return Long.parseLong(rawBody.substring(start, end));
        } catch (Exception e) {
            return null;
        }
    }

    private String matchPlanByAmount(String tierType, Long paidPesewas) {
        if (paidPesewas == null) return null;
        for (String plan : PlanCatalog.VALID_PLANS) {
            int expectedPesewas = PlanCatalog.priceGhs(tierType, plan) * 100;
            if (Math.abs(paidPesewas - expectedPesewas) <= 100) {
                return plan;
            }
        }
        return null;
    }

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    paystackSecret.getBytes(), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = HexFormat.of().formatHex(hash);
            return java.security.MessageDigest.isEqual(
                    computed.getBytes(), signature.getBytes());
        } catch (Exception e) {
            return false;
        }
    }
}