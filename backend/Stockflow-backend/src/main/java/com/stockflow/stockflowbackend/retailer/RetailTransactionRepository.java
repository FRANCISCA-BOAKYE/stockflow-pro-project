package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.RetailTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface RetailTransactionRepository
        extends JpaRepository<RetailTransaction, Long> {

    Page<RetailTransaction> findByBusinessIdOrderByRecordedAtDesc(
            Long businessId, Pageable pageable);

    Page<RetailTransaction> findByBusinessIdAndProductIdOrderByRecordedAtDesc(
            Long businessId, Long productId, Pageable pageable);

    java.util.List<RetailTransaction> findByCustomerIdOrderByRecordedAtDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(t.amountUsd), 0) FROM RetailTransaction t "
            + "WHERE t.business.id = :businessId AND t.type = 'OUT' "
            + "AND t.recordedAt >= :start AND t.recordedAt < :end")
    BigDecimal sumSalesInRange(@Param("businessId") Long businessId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}