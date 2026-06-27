package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.model.ProductionRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductionRunRepository
        extends JpaRepository<ProductionRun, Long> {
    List<ProductionRun> findByBusinessIdOrderByConfirmedAtDesc(
            Long businessId);
}