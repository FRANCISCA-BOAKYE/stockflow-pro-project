package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal; import java.util.List;

@Getter @Setter
public class CreateRecipeRequest {
    private String productName;
    private String unitLabel;
    private String groupLabel;
    private Integer unitsPerGroup;
    private List<RecipeMaterialItem> materials;

    @Getter @Setter
    public static class RecipeMaterialItem {
        private Long materialId;
        private BigDecimal quantityPerUnit;
    }
}