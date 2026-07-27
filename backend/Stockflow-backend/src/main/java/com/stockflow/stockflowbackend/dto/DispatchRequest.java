package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal; import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class DispatchRequest {
    private List<DispatchItemRequest> items;
    private Long wholesalerBusinessId; // omit for a walk-in buyer with no linked account
    private String buyerName; // required when wholesalerBusinessId is omitted
    private String paymentMode;
    private String mobileMoneyNumber; // required when paymentMode is MOBILE_MONEY
    private LocalDate dueDate;

    /** "PICKUP" (buyer collects) or "DELIVERY" (we bring it) — defaults to DELIVERY. */
    private String deliveryMode;
    private BigDecimal deliveryFeeUsd;
    private String driverName;
    private String vehicleNumber;
    private String driverContact;
    private String driverIdNumber;
    private String buyerEmail; // optional — if set and deliveryMode is PICKUP, a pickup code is emailed here
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
    private String idempotencyKey; // client-generated, reused on retry — safe to resend after a dropped connection
}
