package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class MaterialStockInRequest {
    private Long materialId;
    private BigDecimal quantity; // in the material's base unit — used when packageCount is omitted
    private BigDecimal packageCount; // alternative to quantity: number of packages, converted via the material's unitsPerPackage
}