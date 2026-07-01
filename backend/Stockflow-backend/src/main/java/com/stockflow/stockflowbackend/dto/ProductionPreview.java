package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal; import java.util.List;

@Getter @Setter
public class ProductionPreview {
    private Integer totalUnits;
    private List<MaterialResult> materials;
    private Boolean feasible;
    private String message;

    public ProductionPreview(Integer totalUnits,
                             List<MaterialResult> materials, Boolean feasible) {
        this.totalUnits = totalUnits;
        this.materials = materials;
        this.feasible = feasible;
        this.message = feasible ? "Run is feasible"
                : "Run blocked - insufficient materials";
    }
}