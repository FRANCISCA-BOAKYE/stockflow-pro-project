package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class DispatchResponse {
    private String invoiceNumber;
    private List<LineItemSummary> items;
    private BigDecimal deliveryFeeUsd;
    private BigDecimal totalUsd;
    private String paymentMode;
    private String status;
    private LocalDateTime dispatchedAt;
    private Long creditRecordId;
    private String pickupCode;

    public DispatchResponse(String invoiceNumber, List<LineItemSummary> items,
                             BigDecimal deliveryFeeUsd, BigDecimal totalUsd,
                             String paymentMode, String status,
                             LocalDateTime dispatchedAt, Long creditRecordId, String pickupCode) {
        this.invoiceNumber = invoiceNumber;
        this.items = items;
        this.deliveryFeeUsd = deliveryFeeUsd;
        this.totalUsd = totalUsd;
        this.paymentMode = paymentMode;
        this.status = status;
        this.dispatchedAt = dispatchedAt;
        this.creditRecordId = creditRecordId;
        this.pickupCode = pickupCode;
    }
}
