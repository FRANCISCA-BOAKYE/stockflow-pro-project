package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private Long businessId;
    private String businessName;
    private String tierType;
    private String subscriptionStatus;

    public LoginResponse(String token, String name, String email,
                         String role, Long businessId, String businessName,
                         String tierType, String subscriptionStatus) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.role = role;
        this.businessId = businessId;
        this.businessName = businessName;
        this.tierType = tierType;
        this.subscriptionStatus = subscriptionStatus;
    }
}