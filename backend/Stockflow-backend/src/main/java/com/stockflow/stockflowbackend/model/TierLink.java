package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tier_links")
@Getter
@Setter
@NoArgsConstructor
public class TierLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_business_id", nullable = false)
    private Business requesterBusiness;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_business_id", nullable = false)
    private Business partnerBusiness;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;
}