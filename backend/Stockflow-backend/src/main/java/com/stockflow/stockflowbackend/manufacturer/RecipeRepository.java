package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.model.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByBusinessIdAndIsActiveTrue(Long businessId);
    Optional<Recipe> findByBusinessIdAndId(Long businessId, Long id);
}
