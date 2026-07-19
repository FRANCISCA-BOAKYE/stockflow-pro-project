package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class DispatchItemRequest {
    private Long finishedGoodId;
    private Integer quantity;
    private BigDecimal amountUsd;
}
