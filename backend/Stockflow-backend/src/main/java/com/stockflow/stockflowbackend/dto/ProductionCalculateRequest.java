package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class ProductionCalculateRequest {
    private Long recipeId;
    private Integer targetGroups;
}