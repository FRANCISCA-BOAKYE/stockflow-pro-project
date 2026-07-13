package com.stockflow.stockflowbackend.manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.stockflow.stockflowbackend.model.Material;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;



public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByBusinessId(Long businessId);
    Optional<Material> findByBusinessIdAndId(Long businessId, Long id);
    List<Material> findByBusinessIdAndQuantityLessThanEqual(
            Long businessId, BigDecimal threshold);

    long countByBusinessId(Long businessId);

    @Query("SELECT m FROM Material m WHERE m.business.id = :businessId "
            + "AND m.quantity <= m.minThreshold")
    List<Material> findLowStock(@Param("businessId") Long businessId);
}
