package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreditHoldRequest {
    private Long debtorBusinessId;
    private Boolean holdActive;
}