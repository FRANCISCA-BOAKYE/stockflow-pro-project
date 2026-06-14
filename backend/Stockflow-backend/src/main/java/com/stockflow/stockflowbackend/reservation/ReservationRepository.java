package com.stockflow.stockflowbackend.reservation;

import com.stockflow.stockflowbackend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM Reservation r " +
            "WHERE r.business.id = :businessId AND r.productId = :productId " +
            "AND r.productType = :productType AND r.status = 'ACTIVE'")
    Integer sumActiveReservations(@Param("businessId") Long businessId,
                                  @Param("productId") Long productId,
                                  @Param("productType") String productType);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' AND r.expiresAt < :now")
    List<Reservation> findExpiredReservations(@Param("now") LocalDateTime now);
}