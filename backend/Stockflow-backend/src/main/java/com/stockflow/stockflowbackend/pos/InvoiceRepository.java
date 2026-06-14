package com.stockflow.stockflowbackend.pos;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.stockflow.stockflowbackend.model.Invoice;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Page<Invoice> findBySellerBusinessIdOrderByCreatedAtDesc(
            Long businessId, Pageable pageable);

    Page<Invoice> findByBuyerBusinessIdOrderByCreatedAtDesc(
            Long businessId, Pageable pageable);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.sellerBusiness.id = :businessId")
    Long countBySellerBusinessId(@Param("businessId") Long businessId);

    Page<Invoice> findBySellerBusinessIdAndStatus(
            Long businessId, String status, Pageable pageable);
}