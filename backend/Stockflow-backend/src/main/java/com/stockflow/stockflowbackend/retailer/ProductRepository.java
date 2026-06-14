package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByBusinessIdAndIsActiveTrue(
            Long businessId, Pageable pageable);

    Page<Product> findByBusinessIdAndIsActiveTrueAndNameContainingIgnoreCase(
            Long businessId, String name, Pageable pageable);

    Page<Product> findByBusinessIdAndIsActiveTrueAndCategoryId(
            Long businessId, Long categoryId, Pageable pageable);

    List<Product> findByBusinessIdAndIsActiveTrueAndQuantityLessThanEqual(
            Long businessId, BigDecimal threshold);
}