package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class AddProductRequest {
    private String name;
    private Long categoryId;
    private BigDecimal priceUsd;
    private BigDecimal quantity;
    private BigDecimal minThreshold;
    private String unit;
    private String imageBase64;
}