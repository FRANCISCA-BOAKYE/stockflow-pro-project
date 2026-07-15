package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "finished_goods")
@Getter
@Setter
@NoArgsConstructor
public class FinishedGoods {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false, unique = true)
    private Recipe recipe;

    @Column(name = "quantity_in_stock", nullable = false)
    private Integer quantityInStock = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}