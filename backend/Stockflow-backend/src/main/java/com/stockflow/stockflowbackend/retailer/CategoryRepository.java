package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByBusinessId(Long businessId);
    Optional<Category> findByBusinessIdAndId(Long businessId, Long id);
}