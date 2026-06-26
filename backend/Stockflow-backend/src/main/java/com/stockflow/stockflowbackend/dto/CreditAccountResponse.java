package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class CreditAccountResponse {
    private Long id;
    private Long partnerBusinessId;
    private String partnerBusinessName;
    private BigDecimal amountUsd;
    private LocalDate dueDate;
    private String status;
    private Boolean holdPlaced;
    private String direction; // "OWED_TO_ME" or "I_OWE"

    public CreditAccountResponse(Long id, Long partnerBusinessId,
                                 String partnerBusinessName, BigDecimal amountUsd,
                                 LocalDate dueDate, String status, Boolean holdPlaced,
                                 String direction) {
        this.id = id;
        this.partnerBusinessId = partnerBusinessId;
        this.partnerBusinessName = partnerBusinessName;
        this.amountUsd = amountUsd;
        this.dueDate = dueDate;
        this.status = status;
        this.holdPlaced = holdPlaced;
        this.direction = direction;
    }
}