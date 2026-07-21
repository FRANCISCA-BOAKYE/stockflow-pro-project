package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class WholesaleSaleRequest {
    private List<WholesaleSaleItemRequest> items;
    private Long retailerBusinessId; // omit for a walk-in buyer with no linked account
    private String buyerName; // required when retailerBusinessId is omitted
    private String paymentMode;
    private LocalDate dueDate;
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
}
