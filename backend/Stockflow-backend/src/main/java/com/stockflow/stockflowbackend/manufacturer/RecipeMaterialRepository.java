package com.stockflow.stockflowbackend.manufacturer;
import com.stockflow.stockflowbackend.model.RecipeMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeMaterialRepository extends JpaRepository<RecipeMaterial, Long> {
}