package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ActivityLogResponse {
    private Long id;
    private String actorName;
    private Boolean actorIsSubAccount;
    private String actionType;
    private String description;
    private BigDecimal amountUsd;
    private LocalDateTime createdAt;

    public ActivityLogResponse(Long id, String actorName, Boolean actorIsSubAccount, String actionType,
                                String description, BigDecimal amountUsd, LocalDateTime createdAt) {
        this.id = id;
        this.actorName = actorName;
        this.actorIsSubAccount = actorIsSubAccount;
        this.actionType = actionType;
        this.description = description;
        this.amountUsd = amountUsd;
        this.createdAt = createdAt;
    }
}
