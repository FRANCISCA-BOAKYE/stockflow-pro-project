package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class POSRequest {
    private List<POSItemRequest> items;
    private String paymentMode; // CASH, CARD, MOBILE_MONEY, CREDIT
    private String mobileMoneyNumber; // required when paymentMode is MOBILE_MONEY
    private LocalDate dueDate; // only if CREDIT
    private Long buyerBusinessId; // wholesaler or retailer buying
    private String buyerName; // walk-in customer name for retailers
    private String buyerContact; // walk-in customer phone (Premium)
    private String buyerAddress; // walk-in customer address (Premium)
    private Long reservationId; // from /reserve endpoint — only valid for a single-item sale
    private Boolean isPickup; // customer will collect in person and wants a pickup code by email
    private String buyerEmail; // required when isPickup is true
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
}
