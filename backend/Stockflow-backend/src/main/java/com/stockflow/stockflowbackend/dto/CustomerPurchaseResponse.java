package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CustomerPurchaseResponse {
    private Long id;
    private String productName;
    private BigDecimal quantity;
    private BigDecimal amountUsd;
    private String paymentMode;
    private LocalDateTime recordedAt;

    public CustomerPurchaseResponse(Long id, String productName, BigDecimal quantity,
                                     BigDecimal amountUsd, String paymentMode, LocalDateTime recordedAt) {
        this.id = id;
        this.productName = productName;
        this.quantity = quantity;
        this.amountUsd = amountUsd;
        this.paymentMode = paymentMode;
        this.recordedAt = recordedAt;
    }
}
