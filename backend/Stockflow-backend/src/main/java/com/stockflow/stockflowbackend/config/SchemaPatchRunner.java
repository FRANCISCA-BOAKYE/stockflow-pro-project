package com.stockflow.stockflowbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Hibernate's ddl-auto=update only adds missing tables/columns — it never
 * relaxes an existing NOT NULL constraint when an entity field is later
 * changed to nullable. debtor_business_id was originally NOT NULL and was
 * loosened on the CreditRecord entity to support walk-in (individual)
 * debtors, but the already-provisioned Neon column kept its old constraint.
 * Runs once at startup; DROP CONSTRAINT IF NOT NULL is a no-op if already applied.
 */
@Component
public class SchemaPatchRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SchemaPatchRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public SchemaPatchRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE credit_records ALTER COLUMN debtor_business_id DROP NOT NULL");
        } catch (Exception e) {
            log.warn("Schema patch (debtor_business_id nullable) failed or already applied: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE wholesale_sales ALTER COLUMN retailer_business_id DROP NOT NULL");
        } catch (Exception e) {
            log.warn("Schema patch (retailer_business_id nullable) failed or already applied: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute(
                    "ALTER TABLE dispatches ALTER COLUMN wholesaler_business_id DROP NOT NULL");
        } catch (Exception e) {
            log.warn("Schema patch (wholesaler_business_id nullable) failed or already applied: {}", e.getMessage());
        }
    }
}
