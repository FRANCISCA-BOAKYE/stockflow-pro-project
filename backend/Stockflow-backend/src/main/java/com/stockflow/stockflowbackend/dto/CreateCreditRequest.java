package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreateCreditRequest {
    private Long creditorBusinessId;
    private Long debtorBusinessId;
    private Long transactionId;
    private BigDecimal amountUsd;
    private LocalDate dueDate;
}