package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class WholesaleSaleResponse {
    private String invoiceNumber;
    private List<LineItemSummary> items;
    private BigDecimal totalUsd;
    private String paymentMode;
    private String status;
    private LocalDateTime soldAt;
    private Long creditRecordId;

    public WholesaleSaleResponse(String invoiceNumber, List<LineItemSummary> items,
                                  BigDecimal totalUsd, String paymentMode, String status,
                                  LocalDateTime soldAt, Long creditRecordId) {
        this.invoiceNumber = invoiceNumber;
        this.items = items;
        this.totalUsd = totalUsd;
        this.paymentMode = paymentMode;
        this.status = status;
        this.soldAt = soldAt;
        this.creditRecordId = creditRecordId;
    }
}
