package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class WholesaleSaleRequest {
    private Long productId;
    private BigDecimal quantity;
    private Long retailerBusinessId;
    private BigDecimal amountUsd;
    private String paymentMode;
    private LocalDate dueDate;
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
}