package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispatches")
@Getter
@Setter
@NoArgsConstructor
public class Dispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id", nullable = false)
    private FinishedGoods finishedGood;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wholesaler_business_id", nullable = false)
    private Business wholesalerBusiness;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "amount_usd", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountUsd;

    @Column(name = "payment_mode", nullable = false, length = 20)
    private String paymentMode;

    @Column(name = "credit_record_id")
    private Long creditRecordId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private AppUser recordedBy;

    @Column(name = "dispatched_at", updatable = false)
    private LocalDateTime dispatchedAt = LocalDateTime.now();
}