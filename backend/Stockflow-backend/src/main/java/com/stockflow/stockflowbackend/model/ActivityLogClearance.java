package com.stockflow.stockflowbackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Marks one (business, year, month) as reviewed by the owner. Never deletes or
 * touches the underlying ActivityLog rows — those stay in the database forever
 * for compliance; this table only controls what's decluttered from the default
 * view. Support can always retrieve the full history for a business on request.
 */
@Entity
@Table(name = "activity_log_clearances", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "business_id", "year", "month" })
})
@Getter
@Setter
@NoArgsConstructor
public class ActivityLogClearance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month;

    @Column(name = "cleared_by_name", length = 100)
    private String clearedByName;

    @Column(name = "cleared_at", updatable = false)
    private LocalDateTime clearedAt = LocalDateTime.now();
}
