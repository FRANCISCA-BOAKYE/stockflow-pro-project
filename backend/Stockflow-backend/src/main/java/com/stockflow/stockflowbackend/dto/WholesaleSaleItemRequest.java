package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class WholesaleSaleItemRequest {
    private Long productId;
    private BigDecimal quantity;
    private BigDecimal amountUsd;
}
