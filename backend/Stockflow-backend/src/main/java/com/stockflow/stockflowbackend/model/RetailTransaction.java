package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "retail_transactions")
@Getter
@Setter
@NoArgsConstructor
public class RetailTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, length = 10)
    private String type;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity;

    @Column(name = "amount_usd", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountUsd;

    @Column(name = "payment_mode", nullable = false, length = 20)
    private String paymentMode;

    @Column(name = "credit_record_id")
    private Long creditRecordId;

    @Column(name = "invoice_id")
    private Long invoiceId;

    @Column(name = "buyer_name", length = 200)
    private String buyerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wholesaler_business_id")
    private Business wholesalerBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by", nullable = false)
    private AppUser recordedBy;

    @Column(name = "recorded_at", updatable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();
}