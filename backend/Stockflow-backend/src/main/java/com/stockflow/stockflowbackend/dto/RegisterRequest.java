package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String businessName;
    private String tierType;
    private String subscriptionPlan;
    private String adminName;
    private String adminEmail;
    private String adminPassword;
}