package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.model.WholesaleSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface WholesaleSaleRepository
        extends JpaRepository<WholesaleSale, Long> {

    Page<WholesaleSale> findByBusinessIdOrderBySoldAtDesc(
            Long businessId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(w.amountUsd), 0) FROM WholesaleSale w "
            + "WHERE w.business.id = :businessId "
            + "AND w.soldAt >= :start AND w.soldAt < :end")
    BigDecimal sumSalesInRange(@Param("businessId") Long businessId,
                               @Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end);
}