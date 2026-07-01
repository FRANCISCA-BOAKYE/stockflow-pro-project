package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.model.FinishedGoods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List; import java.util.Optional;

@Repository
public interface FinishedGoodsRepository extends JpaRepository<FinishedGoods, Long> {
    List<FinishedGoods> findByBusinessId(Long businessId);
    Optional<FinishedGoods> findByBusinessIdAndRecipeId(Long businessId, Long recipeId);
}
