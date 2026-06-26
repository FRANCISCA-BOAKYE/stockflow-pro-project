package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.model.Receipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Page<Receipt> findByBusinessIdOrderByReceivedAtDesc(
            Long businessId, Pageable pageable);
}