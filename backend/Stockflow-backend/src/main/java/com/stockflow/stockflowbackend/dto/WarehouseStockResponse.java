package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class WarehouseStockResponse {
    private Long id;
    private String name;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal minThreshold;
    private BigDecimal priceUsd;
    private Boolean isLowStock;

    public WarehouseStockResponse(Long id, String name, String unit,
                                  BigDecimal quantity,
                                  BigDecimal minThreshold,
                                  BigDecimal priceUsd) {
        this.id = id;
        this.name = name;
        this.unit = unit;
        this.quantity = quantity;
        this.minThreshold = minThreshold;
        this.priceUsd = priceUsd;
        this.isLowStock = quantity.compareTo(minThreshold) <= 0;
    }
}