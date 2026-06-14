package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class POSResponse {
    private Long transactionId;
    private String invoiceNumber;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPriceUsd;
    private BigDecimal totalUsd;
    private String paymentMode;
    private String status;
    private LocalDateTime recordedAt;
    private Long creditRecordId;

    public POSResponse(Long transactionId, String invoiceNumber,
                       String productName, Integer quantity,
                       BigDecimal unitPriceUsd, BigDecimal totalUsd,
                       String paymentMode, String status,
                       LocalDateTime recordedAt, Long creditRecordId) {
        this.transactionId = transactionId;
        this.invoiceNumber = invoiceNumber;
        this.productName = productName;
        this.quantity = quantity;
        this.unitPriceUsd = unitPriceUsd;
        this.totalUsd = totalUsd;
        this.paymentMode = paymentMode;
        this.status = status;
        this.recordedAt = recordedAt;
        this.creditRecordId = creditRecordId;
    }
}