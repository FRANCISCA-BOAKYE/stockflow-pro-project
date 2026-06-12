package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class CreditPaymentRequest {
    private Long creditRecordId;
    private BigDecimal amountPaid;
}