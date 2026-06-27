package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class MaterialStockInRequest {
    private Long materialId;
    private BigDecimal quantity;
}