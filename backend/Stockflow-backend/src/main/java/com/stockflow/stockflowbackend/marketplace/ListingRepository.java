package com.stockflow.stockflowbackend.marketplace;

import com.stockflow.stockflowbackend.model.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    @Query("SELECT l FROM Listing l JOIN FETCH l.business WHERE l.isActive = true ORDER BY l.updatedAt DESC")
    List<Listing> findByIsActiveTrueOrderByUpdatedAtDesc();

    @Query("SELECT l FROM Listing l JOIN FETCH l.business WHERE l.isActive = true AND l.tierType = :tierType ORDER BY l.updatedAt DESC")
    List<Listing> findByIsActiveTrueAndTierTypeOrderByUpdatedAtDesc(String tierType);

    Optional<Listing> findByBusinessId(Long businessId);
}