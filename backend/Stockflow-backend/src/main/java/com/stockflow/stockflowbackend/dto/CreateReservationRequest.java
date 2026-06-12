package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReservationRequest {
    private Long productId;
    private String productType; // RETAIL_PRODUCT, WAREHOUSE_PRODUCT, FINISHED_GOOD
    private Integer quantity;
}