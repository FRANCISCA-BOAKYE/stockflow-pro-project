package com.stockflow.stockflowbackend.model;



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

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}