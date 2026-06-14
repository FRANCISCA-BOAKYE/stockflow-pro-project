package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class StockInRequest {
    private Long productId;
    private BigDecimal quantity;
    private Long wholesalerBusinessId;
    private BigDecimal amountUsd;
    private String paymentMode;
    private LocalDate dueDate;
}