package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private String categoryName;
    private String unit;
    private BigDecimal priceUsd;
    private BigDecimal quantity;
    private BigDecimal minThreshold;
    private Boolean isActive;
    private Boolean isLowStock;

    public ProductResponse(Long id, String name, String categoryName,
                           String unit, BigDecimal priceUsd,
                           BigDecimal quantity, BigDecimal minThreshold,
                           Boolean isActive) {
        this.id = id;
        this.name = name;
        this.categoryName = categoryName;
        this.unit = unit;
        this.priceUsd = priceUsd;
        this.quantity = quantity;
        this.minThreshold = minThreshold;
        this.isActive = isActive;
        this.isLowStock = quantity.compareTo(minThreshold) <= 0;
    }
}