package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SubAccountResponse {
    private String role;
    private String email;
    private String temporaryPassword;
    private Boolean isActive;
}