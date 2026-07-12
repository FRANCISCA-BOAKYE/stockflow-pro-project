package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByBusinessIdAndIsActiveTrue(
            Long businessId, Pageable pageable);

    Page<Product> findByBusinessIdAndIsActiveTrueAndNameContainingIgnoreCase(
            Long businessId, String name, Pageable pageable);

    Page<Product> findByBusinessIdAndIsActiveTrueAndCategoryId(
            Long businessId, Long categoryId, Pageable pageable);

    long countByBusinessIdAndIsActiveTrue(Long businessId);

    @Query("SELECT p FROM Product p WHERE p.business.id = :businessId "
            + "AND p.isActive = true AND p.quantity <= p.minThreshold")
    List<Product> findLowStock(@Param("businessId") Long businessId);
}