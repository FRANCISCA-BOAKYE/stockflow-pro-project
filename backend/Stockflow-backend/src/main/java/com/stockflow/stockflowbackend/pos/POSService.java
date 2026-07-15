package com.stockflow.stockflowbackend.pos;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.POSRequest;
import com.stockflow.stockflowbackend.dto.POSResponse;
import com.stockflow.stockflowbackend.email.InvoiceEmailService;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.reservation.ReservationRepository;
import com.stockflow.stockflowbackend.retailer.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class POSService {

    private final ProductRepository productRepository;
    private final ReservationRepository reservationRepository;
    private final CreditRepository creditRepository;
    private final BusinessRepository businessRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceEmailService invoiceEmailService;

    @PersistenceContext
    private EntityManager entityManager;

    public POSService(ProductRepository productRepository,
                      ReservationRepository reservationRepository,
                      CreditRepository creditRepository,
                      BusinessRepository businessRepository,
                      InvoiceRepository invoiceRepository,
                      InvoiceEmailService invoiceEmailService) {
        this.productRepository = productRepository;
        this.reservationRepository = reservationRepository;
        this.creditRepository = creditRepository;
        this.businessRepository = businessRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceEmailService = invoiceEmailService;
    }

    @Transactional
    public POSResponse processRetailSale(POSRequest request,
                                         Long businessId, Long userId) {
        // 1. Load product and validate it belongs to this business
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException(
                    "Product does not belong to this business");
        }

        // 2. Validate reservation if provided
        if (request.getReservationId() != null) {
            Reservation reservation = reservationRepository
                    .findById(request.getReservationId())
                    .orElseThrow(() ->
                            new RuntimeException("Reservation not found"));

            if (!reservation.getStatus().equals("ACTIVE")) {
                throw new RuntimeException(
                        "Reservation is no longer active");
            }

            if (!reservation.getQuantity()
                    .equals(request.getQuantity())) {
                throw new RuntimeException(
                        "Quantity does not match reservation");
            }

            // Release reservation
            reservation.setStatus("RELEASED");
            reservationRepository.save(reservation);
        }

        // 3. Check sufficient stock
        BigDecimal requested = BigDecimal.valueOf(request.getQuantity());
        if (product.getQuantity().compareTo(requested) < 0) {
            throw new RuntimeException("Insufficient stock. Available: "
                    + product.getQuantity());
        }

        // 4. Deduct stock atomically
        product.setQuantity(product.getQuantity().subtract(requested));
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        // 5. Calculate total
        BigDecimal total = request.getUnitPriceUsd()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        Business business = product.getBusiness();

        // 7. Create transaction record
        RetailTransaction tx = new RetailTransaction();
        tx.setBusiness(business);
        tx.setProduct(product);
        tx.setType("OUT");
        tx.setQuantity(requested);
        tx.setAmountUsd(total);
        tx.setPaymentMode(request.getPaymentMode());
        tx.setBuyerName(request.getBuyerName());

        AppUser user = new AppUser();
        user.setId(userId);
        tx.setRecordedBy(user);

        // 8. Handle credit — the buyer may be a registered business (B2B credit)
        // or a walk-in customer with no account (tracked by name only).
        Long creditRecordId = null;
        if ("CREDIT".equals(request.getPaymentMode()) && request.getDueDate() != null) {

            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(business);

            if (request.getBuyerBusinessId() != null) {
                Business buyer = businessRepository
                        .findById(request.getBuyerBusinessId())
                        .orElseThrow(() ->
                                new RuntimeException("Buyer business not found"));
                tx.setWholesalerBusiness(buyer);
                credit.setDebtorBusiness(buyer);
            } else {
                credit.setDebtorName(request.getBuyerName() != null
                        ? request.getBuyerName() : "Walk-in customer");
            }

            credit.setAmountUsd(total);
            credit.setDueDate(request.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord savedCredit = creditRepository.save(credit);
            creditRecordId = savedCredit.getId();
            tx.setCreditRecordId(creditRecordId);
        }

        // 9. Save transaction
        entityManager.persist(tx);
        entityManager.flush();

        // 10. Create invoice
        AppUser invoiceUser = new AppUser();
        invoiceUser.setId(userId);

        Invoice invoice = new Invoice();
        invoice.setSellerBusiness(business);
        invoice.setTotalUsd(total);
        invoice.setSubtotalUsd(total);
        invoice.setPaymentMode(request.getPaymentMode());
        invoice.setStatus("CREDIT".equals(request.getPaymentMode())
                ? "UNPAID" : "PAID");
        invoice.setGeneratedByUser(invoiceUser);
        invoice.setCreditRecordId(creditRecordId);

        if (request.getDueDate() != null) {
            invoice.setDueDate(request.getDueDate());
        }

        if (request.getBuyerBusinessId() != null) {
            Business buyer = businessRepository
                    .findById(request.getBuyerBusinessId())
                    .orElse(null);
            invoice.setBuyerBusiness(buyer);
        }

        if (request.getBuyerName() != null) {
            invoice.setBuyerName(request.getBuyerName());
        }

        Invoice savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(
                invoiceRepository, businessId, invoice);
        tx.setInvoiceId(savedInvoice.getId());
        invoiceEmailService.sendIfEligible(savedInvoice, business);

        return new POSResponse(
                tx.getId(),
                savedInvoice.getInvoiceNumber(),
                product.getName(),
                request.getQuantity(),
                request.getUnitPriceUsd(),
                total,
                request.getPaymentMode(),
                invoice.getStatus(),
                tx.getRecordedAt(),
                creditRecordId
        );
    }
}