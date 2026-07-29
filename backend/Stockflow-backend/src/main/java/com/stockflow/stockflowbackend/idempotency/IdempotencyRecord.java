package com.stockflow.stockflowbackend.idempotency;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Records the exact response already returned for a given (business, key,
 * endpoint) triple, so a retried request — e.g. a mobile client resending a
 * sale after a dropped connection — returns the original result instead of
 * processing the sale a second time.
 */
@Entity
@Table(name = "idempotency_records",
        uniqueConstraints = @UniqueConstraint(columnNames = {"business_id", "idempotency_key", "endpoint"}))
@Getter
@Setter
@NoArgsConstructor
public class IdempotencyRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "idempotency_key", nullable = false, length = 100)
    private String idempotencyKey;

    @Column(name = "endpoint", nullable = false, length = 60)
    private String endpoint;

    @Column(name = "response_json", nullable = false, columnDefinition = "TEXT")
    private String responseJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
