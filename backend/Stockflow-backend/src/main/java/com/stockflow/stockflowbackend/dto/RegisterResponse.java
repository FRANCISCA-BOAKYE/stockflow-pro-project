package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class RegisterResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private Long businessId;
    private String businessName;
    private String tierType;
    private String subscriptionStatus;
    private String subscriptionPlan;
    private List<SubAccountResponse> subAccounts;
}