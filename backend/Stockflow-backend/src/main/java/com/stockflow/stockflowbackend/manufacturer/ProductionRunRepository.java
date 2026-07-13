package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.model.ProductionRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductionRunRepository
        extends JpaRepository<ProductionRun, Long> {
    List<ProductionRun> findByBusinessIdOrderByConfirmedAtDesc(
            Long businessId);

    @Query("SELECT COUNT(p) FROM ProductionRun p WHERE p.business.id = :businessId "
            + "AND p.confirmedAt >= :since")
    long countSince(@Param("businessId") Long businessId,
                     @Param("since") LocalDateTime since);
}