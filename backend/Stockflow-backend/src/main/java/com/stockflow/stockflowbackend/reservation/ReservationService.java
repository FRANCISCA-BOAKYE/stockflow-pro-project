package com.stockflow.stockflowbackend.reservation;

import com.stockflow.stockflowbackend.dto.AvailableStockResponse;
import com.stockflow.stockflowbackend.dto.CreateReservationRequest;
import com.stockflow.stockflowbackend.dto.ReservationResponse;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Reservation;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public ReservationService(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    private static final int RESERVATION_TTL_MINUTES = 10;

    private String getTableName(String productType) {
        switch (productType) {
            case "RETAIL_PRODUCT": return "products";
            case "WAREHOUSE_PRODUCT": return "warehouse_products";
            case "FINISHED_GOOD": return "finished_goods";
            default: throw new RuntimeException("Invalid product type");
        }
    }

    private String getQuantityColumn(String productType) {
        return productType.equals("FINISHED_GOOD") ? "quantity_in_stock" : "quantity";
    }

    private Integer getTotalStock(Long productId, String productType) {
        String table = getTableName(productType);
        String column = getQuantityColumn(productType);

        Object result = entityManager.createNativeQuery(
                        "SELECT " + column + " FROM " + table + " WHERE id = :id")
                .setParameter("id", productId)
                .getSingleResult();

        if (result instanceof Number) {
            return ((Number) result).intValue();
        }
        return 0;
    }

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request,
                                                 Long businessId, Long userId) {
        Integer totalStock = getTotalStock(request.getProductId(), request.getProductType());

        Integer reserved = reservationRepository.sumActiveReservations(
                businessId, request.getProductId(), request.getProductType());

        int available = totalStock - reserved;

        if (request.getQuantity() > available) {
            throw new RuntimeException("Insufficient stock. Available: " + available);
        }

        Reservation reservation = new Reservation();

        Business business = new Business();
        business.setId(businessId);
        reservation.setBusiness(business);

        AppUser user = new AppUser();
        user.setId(userId);
        reservation.setSessionUser(user);

        reservation.setProductId(request.getProductId());
        reservation.setProductType(request.getProductType());
        reservation.setQuantity(request.getQuantity());
        reservation.setStatus("ACTIVE");
        reservation.setExpiresAt(LocalDateTime.now().plusMinutes(RESERVATION_TTL_MINUTES));

        Reservation saved = reservationRepository.save(reservation);

        return new ReservationResponse(saved.getId(), saved.getQuantity(),
                saved.getStatus(), saved.getExpiresAt());
    }

    @Transactional
    public void releaseReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus("RELEASED");
        reservationRepository.save(reservation);
    }

    @Transactional
    public AvailableStockResponse getAvailableStock(Long productId, String productType,
                                                    Long businessId) {
        Integer totalStock = getTotalStock(productId, productType);
        Integer reserved = reservationRepository.sumActiveReservations(
                businessId, productId, productType);

        return new AvailableStockResponse(productId, totalStock, reserved,
                totalStock - reserved);
    }

    @Transactional
    public void expireOldReservations() {
        var expired = reservationRepository.findExpiredReservations(LocalDateTime.now());
        for (Reservation r : expired) {
            r.setStatus("EXPIRED");
        }
        reservationRepository.saveAll(expired);
    }
}