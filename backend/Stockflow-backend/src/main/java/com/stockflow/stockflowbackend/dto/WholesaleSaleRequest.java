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
    private String mobileMoneyNumber; // required when paymentMode is MOBILE_MONEY
    private LocalDate dueDate;
    private Boolean isPickup; // buyer will collect in person and wants a pickup code by email
    private String buyerEmail; // required when isPickup is true
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
    private String idempotencyKey; // client-generated, reused on retry — safe to resend after a dropped connection
}
