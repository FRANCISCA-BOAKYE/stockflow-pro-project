package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_runs")
@Getter
@Setter
@NoArgsConstructor
public class ProductionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe Recipe;

    @Column(name = "target_groups", nullable = false)
    private Integer targetGroups;

    @Column(name = "total_units", nullable = false)
    private Integer totalUnits;

    @Column(name = "total_cost_usd", precision = 12, scale = 2)
    private BigDecimal totalCostUsd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by", nullable = false)
    private AppUser confirmedBy;

    @OneToMany(mappedBy = "productionRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProductionUsage> usages = new ArrayList<>();

    @Column(name = "confirmed_at", updatable = false)
    private LocalDateTime confirmedAt = LocalDateTime.now();
}