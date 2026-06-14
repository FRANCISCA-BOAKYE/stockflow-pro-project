package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.model.WholesaleSale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WholesaleSaleRepository
        extends JpaRepository<WholesaleSale, Long> {

    Page<WholesaleSale> findByBusinessIdOrderBySoldAtDesc(
            Long businessId, Pageable pageable);
}