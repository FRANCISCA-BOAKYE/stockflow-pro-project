package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.RetailTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetailTransactionRepository
        extends JpaRepository<RetailTransaction, Long> {

    Page<RetailTransaction> findByBusinessIdOrderByRecordedAtDesc(
            Long businessId, Pageable pageable);

    Page<RetailTransaction> findByBusinessIdAndProductIdOrderByRecordedAtDesc(
            Long businessId, Long productId, Pageable pageable);
}