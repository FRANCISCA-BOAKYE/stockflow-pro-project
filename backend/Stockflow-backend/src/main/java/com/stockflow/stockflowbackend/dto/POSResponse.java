package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class POSResponse {
    private String invoiceNumber;
    private List<LineItemSummary> items;
    private BigDecimal totalUsd;
    private String paymentMode;
    private String status;
    private LocalDateTime recordedAt;
    private Long creditRecordId;
    private String pickupCode;
    private Long customerId;

    public POSResponse(String invoiceNumber, List<LineItemSummary> items,
                       BigDecimal totalUsd, String paymentMode, String status,
                       LocalDateTime recordedAt, Long creditRecordId, String pickupCode, Long customerId) {
        this.invoiceNumber = invoiceNumber;
        this.items = items;
        this.totalUsd = totalUsd;
        this.paymentMode = paymentMode;
        this.status = status;
        this.recordedAt = recordedAt;
        this.creditRecordId = creditRecordId;
        this.pickupCode = pickupCode;
        this.customerId = customerId;
    }
}
