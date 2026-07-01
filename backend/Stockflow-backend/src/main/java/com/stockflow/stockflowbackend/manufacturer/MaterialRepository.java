package com.stockflow.stockflowbackend.manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;
import com.stockflow.stockflowbackend.model.Material;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;



public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByBusinessId(Long businessId);
    Optional<Material> findByBusinessIdAndId(Long businessId, Long id);
    List<Material> findByBusinessIdAndQuantityLessThanEqual(
            Long businessId, BigDecimal threshold);
}
