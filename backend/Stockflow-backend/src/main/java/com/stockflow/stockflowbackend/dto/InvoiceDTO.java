package com.stockflow.stockflowbackend.dto;

import com.stockflow.stockflowbackend.model.Invoice;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private String sellerBusinessName;
    private String buyerBusinessName;
    private String buyerName;
    private BigDecimal subtotalUsd;
    private BigDecimal totalUsd;
    private String paymentMode;
    private LocalDate dueDate;
    private String status;
    private String pickupCode;
    private LocalDateTime createdAt;
    private List<LineItemSummary> items;

    public InvoiceDTO(Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();
        this.sellerBusinessName = invoice.getSellerBusiness() != null
                ? invoice.getSellerBusiness().getName() : null;
        this.buyerBusinessName = invoice.getBuyerBusiness() != null
                ? invoice.getBuyerBusiness().getName() : null;
        this.buyerName = invoice.getBuyerName();
        this.subtotalUsd = invoice.getSubtotalUsd();
        this.totalUsd = invoice.getTotalUsd();
        this.paymentMode = invoice.getPaymentMode();
        this.dueDate = invoice.getDueDate();
        this.status = invoice.getStatus();
        this.pickupCode = invoice.getPickupCode();
        this.createdAt = invoice.getCreatedAt();
        this.items = invoice.getItems() == null ? List.of() : invoice.getItems().stream()
                .map(i -> new LineItemSummary(i.getProductName(), i.getQuantity(), i.getUnit(),
                        i.getUnitPriceUsd(), i.getLineTotalUsd()))
                .collect(Collectors.toList());
    }
}