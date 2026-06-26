package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_records")
@Getter
@Setter
@NoArgsConstructor
public class CreditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creditor_business_id", nullable = false)
    private Business creditorBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debtor_business_id", nullable = false)
    private Business debtorBusiness;

    @Column(name = "amount_usd", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountUsd;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status = "OUTSTANDING";

    @Column(name = "hold_placed", nullable = false)
    private Boolean holdPlaced = false;

    @Column(name = "settled_at")
    private LocalDateTime settledAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}