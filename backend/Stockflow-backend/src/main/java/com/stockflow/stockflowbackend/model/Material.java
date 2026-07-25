package com.stockflow.stockflowbackend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
@Getter
@Setter
@NoArgsConstructor
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 50)
    private String unit;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "min_threshold", nullable = false, precision = 14, scale = 3)
    private BigDecimal minThreshold = BigDecimal.ZERO;

    @Column(name = "cost_per_unit", precision = 10, scale = 4)
    private BigDecimal costPerUnit;

    /**
     * Optional bulk/purchase unit definition, e.g. "box" — with unitsPerPackage
     * telling you how many of the base `unit` (above) are in one package, e.g.
     * "1 box = 12 pieces". Stock (quantity, above) always stays in the base
     * unit — this is purely a convenience for entering stock in package terms
     * and for showing the definition wherever the material is used in a recipe.
     */
    @Column(name = "package_unit", length = 50)
    private String packageUnit;

    @Column(name = "units_per_package", precision = 12, scale = 4)
    private BigDecimal unitsPerPackage;

    /** A photo of the material, stored as a data URI (e.g. "data:image/jpeg;base64,..."). */
    @Column(name = "image_base64", columnDefinition = "TEXT")
    private String imageBase64;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}