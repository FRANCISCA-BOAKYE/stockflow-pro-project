package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class ReceiveStockRequest {
    private Long productId;
    private BigDecimal quantity;
    private Long manufacturerBusinessId;
    private BigDecimal amountUsd;
    private String paymentMode;
    private LocalDate dueDate;
}