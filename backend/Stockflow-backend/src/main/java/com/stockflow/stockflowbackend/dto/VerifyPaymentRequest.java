package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyPaymentRequest {
    private String reference;
    private String plan;
}
