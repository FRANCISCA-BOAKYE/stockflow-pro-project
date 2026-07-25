package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class CustomerResponse {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private BigDecimal totalSpentUsd;
    private Integer purchaseCount;
    private LocalDateTime lastPurchaseAt;

    public CustomerResponse(Long id, String name, String phone, String email, String address,
                             BigDecimal totalSpentUsd, Integer purchaseCount, LocalDateTime lastPurchaseAt) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.address = address;
        this.totalSpentUsd = totalSpentUsd;
        this.purchaseCount = purchaseCount;
        this.lastPurchaseAt = lastPurchaseAt;
    }
}
