package com.stockflow.stockflowbackend.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IdempotencyRepository extends JpaRepository<IdempotencyRecord, Long> {
    Optional<IdempotencyRecord> findByBusinessIdAndIdempotencyKeyAndEndpoint(
            Long businessId, String idempotencyKey, String endpoint);
}
