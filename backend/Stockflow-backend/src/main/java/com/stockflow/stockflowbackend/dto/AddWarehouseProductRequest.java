package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class AddWarehouseProductRequest {
    private String name;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal minThreshold;
    private BigDecimal priceUsd;
}