package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * An audit trail entry for a business — who (owner or sub-account) did what,
 * so an owner can review team activity for anything that looks off.
 */
@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private AppUser actor;

    /** Denormalized so the log still reads correctly even if the actor's account is later removed. */
    @Column(name = "actor_name", nullable = false, length = 100)
    private String actorName;

    @Column(name = "actor_is_sub_account", nullable = false)
    private Boolean actorIsSubAccount = false;

    @Column(name = "action_type", nullable = false, length = 40)
    private String actionType;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "amount_usd", precision = 12, scale = 2)
    private BigDecimal amountUsd;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
