package com.stockflow.stockflowbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "recipe_materials")
@Getter
@Setter
@NoArgsConstructor
public class RecipeMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    @JsonIgnoreProperties({"materials", "hibernateLazyInitializer", "handler"})
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Material material;

    @Column(name = "quantity_per_unit", nullable = false, precision = 12, scale = 4)
    private BigDecimal quantityPerUnit;
}