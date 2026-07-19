package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class LineItemSummary {
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal unitPriceUsd;
    private BigDecimal lineTotalUsd;

    public LineItemSummary(String productName, BigDecimal quantity, String unit,
                            BigDecimal unitPriceUsd, BigDecimal lineTotalUsd) {
        this.productName = productName;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPriceUsd = unitPriceUsd;
        this.lineTotalUsd = lineTotalUsd;
    }
}
