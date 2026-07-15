package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeEmailRequest {
    private String currentPassword;
    private String newEmail;
}
