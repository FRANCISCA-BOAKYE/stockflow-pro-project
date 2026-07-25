package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal;

@Getter @Setter
public class AddMaterialRequest {
    private String name;
    private String unit;
    private BigDecimal quantity;
    private BigDecimal minThreshold;
    private BigDecimal costPerUnit;
    private String packageUnit; // optional, e.g. "box"
    private BigDecimal unitsPerPackage; // optional, e.g. 12 (for "1 box = 12 pieces")
}