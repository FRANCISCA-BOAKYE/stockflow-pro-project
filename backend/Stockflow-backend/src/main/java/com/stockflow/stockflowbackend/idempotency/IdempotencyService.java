package com.stockflow.stockflowbackend.idempotency;

import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Generic "have we already done this" check for write endpoints that must
 * never double-process a retried request — e.g. a mobile client resending a
 * sale after a dropped connection while offline. Callers pass a client-
 * generated key (a UUID created once per user action, reused on every retry
 * of that same action) plus a short endpoint tag; on a repeat, the exact
 * original response is replayed instead of the business logic running again.
 *
 * Concurrency note: this checks-then-saves without a lock, so two genuinely
 * simultaneous requests with the same key could both pass the check before
 * either saves. That's an accepted tradeoff here — the real-world case this
 * protects is a single device retrying its own request after reconnecting,
 * not concurrent duplicate submissions — but the DB unique constraint still
 * guarantees only one record is ever stored, so at least the audit trail
 * never shows a key processed twice even if this edge case is hit.
 */
@Service
public class IdempotencyService {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

    private final IdempotencyRepository repository;
    private final ObjectMapper objectMapper;

    public IdempotencyService(IdempotencyRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public <T> Optional<T> find(Long businessId, String key, String endpoint, Class<T> type) {
        if (key == null || key.isBlank()) {
            return Optional.empty();
        }
        return repository.findByBusinessIdAndIdempotencyKeyAndEndpoint(businessId, key, endpoint)
                .map(record -> {
                    try {
                        return objectMapper.readValue(record.getResponseJson(), type);
                    } catch (Exception e) {
                        log.warn("Could not replay stored idempotent response for key {}: {}", key, e.getMessage());
                        return null;
                    }
                });
    }

    public void save(Long businessId, String key, String endpoint, Object response) {
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            IdempotencyRecord record = new IdempotencyRecord();
            record.setBusinessId(businessId);
            record.setIdempotencyKey(key);
            record.setEndpoint(endpoint);
            record.setResponseJson(objectMapper.writeValueAsString(response));
            repository.save(record);
        } catch (Exception e) {
            // Never let idempotency bookkeeping break an otherwise-successful request.
            log.warn("Could not store idempotency record for key {}: {}", key, e.getMessage());
        }
    }
}
