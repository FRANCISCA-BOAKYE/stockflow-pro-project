package com.stockflow.stockflowbackend.tierlink;

import com.stockflow.stockflowbackend.model.TierLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TierLinkRepository extends JpaRepository<TierLink, Long> {

    List<TierLink> findByRequesterBusinessIdAndStatus(
            Long businessId, String status);

    List<TierLink> findByPartnerBusinessIdAndStatus(
            Long businessId, String status);

    Optional<TierLink> findByRequesterBusinessIdAndPartnerBusinessId(
            Long requesterId, Long partnerId);

    @Query("SELECT COUNT(t) FROM TierLink t WHERE t.status = 'ACTIVE' AND ("
            + "(t.requesterBusiness.id = :businessId AND t.partnerBusiness.tierType = 'RETAILER') OR "
            + "(t.partnerBusiness.id = :businessId AND t.requesterBusiness.tierType = 'RETAILER'))")
    long countActiveRetailerPartners(@Param("businessId") Long businessId);
}