package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyPaymentResponse {
    private boolean verified;
    private String message;
    private String subscriptionStatus;
    private String subscriptionPlan;

    public VerifyPaymentResponse(boolean verified, String message,
                                 String subscriptionStatus, String subscriptionPlan) {
        this.verified = verified;
        this.message = message;
        this.subscriptionStatus = subscriptionStatus;
        this.subscriptionPlan = subscriptionPlan;
    }
}
