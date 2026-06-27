package com.stockflow.stockflowbackend.dto;
import lombok.Getter; import lombok.Setter;
import java.math.BigDecimal; import java.time.LocalDate;

@Getter @Setter
public class DispatchRequest {
    private Long finishedGoodId;
    private Long wholesalerBusinessId;
    private Integer quantity;
    private BigDecimal amountUsd;
    private String paymentMode;
    private LocalDate dueDate;
}