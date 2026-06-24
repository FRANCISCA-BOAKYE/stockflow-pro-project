package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class MaterialResult {
    private Long materialId;
    private String materialName;
    private String unit;
    private BigDecimal required;
    private BigDecimal inStock;
    private BigDecimal remaining;
    private Boolean sufficient;

    public MaterialResult(Long materialId, String materialName,
                          String unit, BigDecimal required, BigDecimal inStock) {
        this.materialId = materialId;
        this.materialName = materialName;
        this.unit = unit;
        this.required = required;
        this.inStock = inStock;
        this.remaining = inStock.subtract(required);
        this.sufficient = this.remaining.compareTo(BigDecimal.ZERO) >= 0;
    }
}