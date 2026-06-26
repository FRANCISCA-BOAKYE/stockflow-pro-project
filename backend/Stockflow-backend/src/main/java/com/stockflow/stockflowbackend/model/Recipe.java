package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @Column(name = "unit_label", nullable = false, length = 50)
    private String unitLabel;

    @Column(name = "group_label", nullable = false, length = 50)
    private String groupLabel;

    @Column(name = "units_per_group", nullable = false)
    private Integer unitsPerGroup;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RecipeMaterial> materials;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}