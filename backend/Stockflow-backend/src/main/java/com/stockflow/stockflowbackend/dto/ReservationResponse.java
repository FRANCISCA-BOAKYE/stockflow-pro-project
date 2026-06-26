package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationResponse {
    private Long reservationId;
    private Integer quantity;
    private String status;
    private LocalDateTime expiresAt;

    public ReservationResponse(Long reservationId, Integer quantity,
                               String status, LocalDateTime expiresAt) {
        this.reservationId = reservationId;
        this.quantity = quantity;
        this.status = status;
        this.expiresAt = expiresAt;
    }
}
