package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationListItem {
    private Long id;
    private Long productId;
    private String productType;
    private Integer quantity;
    private String status;
    private LocalDateTime expiresAt;

    public ReservationListItem(Long id, Long productId, String productType,
                               Integer quantity, String status, LocalDateTime expiresAt) {
        this.id = id;
        this.productId = productId;
        this.productType = productType;
        this.quantity = quantity;
        this.status = status;
        this.expiresAt = expiresAt;
    }
}
