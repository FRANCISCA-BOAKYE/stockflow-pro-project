package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal; import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class DispatchRequest {
    private List<DispatchItemRequest> items;
    private Long wholesalerBusinessId;
    private String paymentMode;
    private LocalDate dueDate;

    /** "PICKUP" (buyer collects) or "DELIVERY" (we bring it) — defaults to DELIVERY. */
    private String deliveryMode;
    private BigDecimal deliveryFeeUsd;
    private String driverName;
    private String vehicleNumber;
    private String driverContact;
    private String driverIdNumber;
    private Boolean wantsInvoice;
    private String paystackReference; // required when paymentMode is CARD
}
