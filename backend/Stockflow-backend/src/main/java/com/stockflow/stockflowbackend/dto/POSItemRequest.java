package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class POSItemRequest {
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPriceUsd;
}
