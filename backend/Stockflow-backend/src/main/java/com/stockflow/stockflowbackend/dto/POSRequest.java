package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class POSRequest {
    private Long productId;
    private String productType; // RETAIL_PRODUCT, WAREHOUSE_PRODUCT, FINISHED_GOOD
    private Integer quantity;
    private BigDecimal unitPriceUsd;
    private String paymentMode; // CASH, CARD, MOBILE_MONEY, CREDIT
    private LocalDate dueDate; // only if CREDIT
    private Long buyerBusinessId; // wholesaler or retailer buying
    private String buyerName; // walk-in customer name for retailers
    private String buyerContact; // walk-in customer phone (Premium)
    private String buyerAddress; // walk-in customer address (Premium)
    private Long reservationId; // from /reserve endpoint
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
}