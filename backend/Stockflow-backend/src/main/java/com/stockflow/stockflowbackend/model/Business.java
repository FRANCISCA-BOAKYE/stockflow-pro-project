package com.stockflow.stockflowbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "businesses")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Business {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "tier_type", nullable = false, length = 20)
    private String tierType;

    @Column(name = "subscription_plan", length = 20)
    private String subscriptionPlan;

    @Column(name = "subscription_status", length = 20)
    private String subscriptionStatus;

    @Column(name = "trial_started_at")
    private LocalDateTime trialStartedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}