package com.stockflow.stockflowbackend.payment;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
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

    private static final String PAYSTACK_SECRET = "sk_test_3bbd1c1dabf095c6200abb15eb7631ddb8610104";

    public PaystackWebhookController(
            BusinessRepository businessRepository,
            UserRepository userRepository) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(value = "x-paystack-signature", required = false) String signature,
            @RequestBody String rawBody) {

        if (signature != null && !verifySignature(rawBody, signature)) {
            return ResponseEntity.status(401).body("Invalid signature");
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> event = mapper.readValue(rawBody, Map.class);
            String eventType = (String) event.get("event");

            if ("charge.success".equals(eventType)) {
                Map<String, Object> data = (Map<String, Object>) event.get("data");

                String email = null;
                if (data.get("customer") instanceof Map) {
                    Map<String, Object> customer = (Map<String, Object>) data.get("customer");
                    email = (String) customer.get("email");
                }
                if (email == null) {
                    email = (String) data.get("customer_email");
                }

                if (email != null) {
                    Optional<AppUser> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        AppUser user = userOpt.get();
                        Optional<Business> bizOpt = businessRepository.findById(
                                user.getBusiness().getId());
                        if (bizOpt.isPresent()) {
                            Business business = bizOpt.get();
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

    private boolean verifySignature(String payload, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(
                    PAYSTACK_SECRET.getBytes(), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(payload.getBytes());
            String computed = HexFormat.of().formatHex(hash);
            return computed.equals(signature);
        } catch (Exception e) {
            return false;
        }
    }
}