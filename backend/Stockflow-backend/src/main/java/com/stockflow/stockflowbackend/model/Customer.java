package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * A persistent walk-in customer record, scoped to one business. Matched and
 * reused across purchases by phone number, so a business can see one
 * customer's full history instead of every sale starting from a blank name.
 */
@Entity
@Table(name = "customers", uniqueConstraints = @UniqueConstraint(columnNames = {"business_id", "phone"}))
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false, length = 200)
    private String name;

    /** The matching key a business re-identifies a returning customer by. */
    @Column(length = 30)
    private String phone;

    @Column(length = 200)
    private String email;

    @Column(length = 300)
    private String address;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
