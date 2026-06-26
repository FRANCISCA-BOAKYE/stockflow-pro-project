package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.model.WarehouseProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseProductRepository
        extends JpaRepository<WarehouseProduct, Long> {

    List<WarehouseProduct> findByBusinessId(Long businessId);

    Optional<WarehouseProduct> findByBusinessIdAndId(
            Long businessId, Long id);

    List<WarehouseProduct> findByBusinessIdAndQuantityLessThanEqual(
            Long businessId, BigDecimal threshold);
}