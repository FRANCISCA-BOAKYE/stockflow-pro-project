package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AvailableStockResponse {
    private Long productId;
    private Integer totalStock;
    private Integer reserved;
    private Integer available;

    public AvailableStockResponse(Long productId, Integer totalStock,
                                  Integer reserved, Integer available) {
        this.productId = productId;
        this.totalStock = totalStock;
        this.reserved = reserved;
        this.available = available;
    }
}