package com.stockflow.stockflowbackend.pos;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.LineItemSummary;
import com.stockflow.stockflowbackend.dto.POSItemRequest;
import com.stockflow.stockflowbackend.dto.POSRequest;
import com.stockflow.stockflowbackend.dto.POSResponse;
import com.stockflow.stockflowbackend.email.InvoiceEmailService;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.payment.PaystackTransactionVerifier;
import com.stockflow.stockflowbackend.reservation.ReservationRepository;
import com.stockflow.stockflowbackend.retailer.ProductRepository;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class POSService {

    private final ProductRepository productRepository;
    private final ReservationRepository reservationRepository;
    private final CreditRepository creditRepository;
    private final BusinessRepository businessRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceEmailService invoiceEmailService;
    private final SubscriptionService subscriptionService;
    private final PaystackTransactionVerifier paystackTransactionVerifier;

    @PersistenceContext
    private EntityManager entityManager;

    public POSService(ProductRepository productRepository,
                      ReservationRepository reservationRepository,
                      CreditRepository creditRepository,
                      BusinessRepository businessRepository,
                      InvoiceRepository invoiceRepository,
                      InvoiceEmailService invoiceEmailService,
                      SubscriptionService subscriptionService,
                      PaystackTransactionVerifier paystackTransactionVerifier) {
        this.productRepository = productRepository;
        this.reservationRepository = reservationRepository;
        this.creditRepository = creditRepository;
        this.businessRepository = businessRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceEmailService = invoiceEmailService;
        this.subscriptionService = subscriptionService;
        this.paystackTransactionVerifier = paystackTransactionVerifier;
    }

    @Transactional
    public POSResponse processRetailSale(POSRequest request,
                                         Long businessId, Long userId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }
        if ("MOBILE_MONEY".equals(request.getPaymentMode())
                && (request.getMobileMoneyNumber() == null || request.getMobileMoneyNumber().isBlank())) {
            throw new RuntimeException("Mobile money number is required for this payment mode");
        }
        for (POSItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be greater than zero");
            }
            if (item.getUnitPriceUsd() == null || item.getUnitPriceUsd().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Unit price cannot be negative");
            }
        }

        // 1. Load every product, validate ownership and stock
        List<Product> products = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (POSItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            if (!product.getBusiness().getId().equals(businessId)) {
                throw new RuntimeException("Product does not belong to this business");
            }
            BigDecimal requested = BigDecimal.valueOf(item.getQuantity());
            if (product.getQuantity().compareTo(requested) < 0) {
                throw new RuntimeException("Insufficient stock for " + product.getName()
                        + ". Available: " + product.getQuantity());
            }
            products.add(product);
            total = total.add(item.getUnitPriceUsd().multiply(requested));
        }

        // 2. Validate reservation if provided — only valid for a single-item sale
        if (request.getReservationId() != null) {
            if (request.getItems().size() != 1) {
                throw new RuntimeException("A reservation can only be completed as a single-item sale");
            }
            Reservation reservation = reservationRepository
                    .findByBusinessIdAndId(businessId, request.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            if (!reservation.getStatus().equals("ACTIVE")) {
                throw new RuntimeException("Reservation is no longer active");
            }

            POSItemRequest onlyItem = request.getItems().get(0);
            if (!reservation.getProductId().equals(onlyItem.getProductId())
                    || !reservation.getProductType().equals("RETAIL_PRODUCT")) {
                throw new RuntimeException("Reservation does not match this product");
            }

            if (!reservation.getQuantity().equals(onlyItem.getQuantity())) {
                throw new RuntimeException("Quantity does not match reservation");
            }

            reservation.setStatus("RELEASED");
            reservationRepository.save(reservation);
        }

        // 3. Confirm a CARD sale was actually paid before touching stock
        if ("CARD".equals(request.getPaymentMode())) {
            paystackTransactionVerifier.verifyPaid(request.getPaystackReference(), total);
        }

        // 4. Deduct stock atomically for every item
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            BigDecimal requested = BigDecimal.valueOf(request.getItems().get(i).getQuantity());
            product.setQuantity(product.getQuantity().subtract(requested));
            product.setUpdatedAt(LocalDateTime.now());
            productRepository.save(product);
        }

        Business business = products.get(0).getBusiness();

        AppUser user = new AppUser();
        user.setId(userId);

        // 5. Handle credit — the buyer may be a registered business (B2B credit)
        // or a walk-in customer with no account (tracked by name only).
        Long creditRecordId = null;
        if ("CREDIT".equals(request.getPaymentMode()) && request.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(business);

            if (request.getBuyerBusinessId() != null) {
                Business buyer = businessRepository
                        .findById(request.getBuyerBusinessId())
                        .orElseThrow(() -> new RuntimeException("Buyer business not found"));
                credit.setDebtorBusiness(buyer);
            } else {
                credit.setDebtorName(request.getBuyerName() != null
                        ? request.getBuyerName() : "Walk-in customer");
                if (subscriptionService.hasFeature(business, SubscriptionFeature.CREDIT_CONTACT_INFO)) {
                    credit.setDebtorContact(request.getBuyerContact());
                    credit.setDebtorAddress(request.getBuyerAddress());
                }
            }

            credit.setAmountUsd(total);
            credit.setDueDate(request.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord savedCredit = creditRepository.save(credit);
            creditRecordId = savedCredit.getId();
        }

        // 6. Create one transaction row per item, sharing the same credit record
        List<RetailTransaction> transactions = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            POSItemRequest item = request.getItems().get(i);
            RetailTransaction tx = new RetailTransaction();
            tx.setBusiness(business);
            tx.setProduct(product);
            tx.setType("OUT");
            tx.setQuantity(BigDecimal.valueOf(item.getQuantity()));
            tx.setAmountUsd(item.getUnitPriceUsd().multiply(BigDecimal.valueOf(item.getQuantity())));
            tx.setPaymentMode(request.getPaymentMode());
            tx.setMobileMoneyNumber(request.getMobileMoneyNumber());
            tx.setBuyerName(request.getBuyerName());
            tx.setRecordedBy(user);
            if (request.getBuyerBusinessId() != null) {
                Business buyer = businessRepository.findById(request.getBuyerBusinessId()).orElse(null);
                tx.setWholesalerBusiness(buyer);
            }
            tx.setCreditRecordId(creditRecordId);
            entityManager.persist(tx);
            transactions.add(tx);
        }
        entityManager.flush();

        // 7. Create invoice — Standard tier always gets one; Premium tier can be
        // asked per-sale whether the buyer wants one at all.
        boolean canSkipInvoice = subscriptionService.hasFeature(business, SubscriptionFeature.INVOICE_ON_DEMAND);
        boolean wantsInvoice = request.getWantsInvoice() == null || request.getWantsInvoice();
        Invoice savedInvoice = null;

        if (!canSkipInvoice || wantsInvoice) {
            Invoice invoice = new Invoice();
            invoice.setSellerBusiness(business);
            invoice.setTotalUsd(total);
            invoice.setSubtotalUsd(total);
            invoice.setPaymentMode(request.getPaymentMode());
            invoice.setStatus("CREDIT".equals(request.getPaymentMode()) ? "UNPAID" : "PAID");
            invoice.setGeneratedByUser(user);
            invoice.setCreditRecordId(creditRecordId);

            if (request.getDueDate() != null) {
                invoice.setDueDate(request.getDueDate());
            }
            if (request.getBuyerBusinessId() != null) {
                Business buyer = businessRepository.findById(request.getBuyerBusinessId()).orElse(null);
                invoice.setBuyerBusiness(buyer);
            }
            if (request.getBuyerName() != null) {
                invoice.setBuyerName(request.getBuyerName());
            }
            boolean isPickup = Boolean.TRUE.equals(request.getIsPickup())
                    && request.getBuyerEmail() != null && !request.getBuyerEmail().isBlank();
            if (isPickup) {
                invoice.setPickupCode(com.stockflow.stockflowbackend.email.PickupCodeUtil.generate());
            }

            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (int i = 0; i < products.size(); i++) {
                Product product = products.get(i);
                POSItemRequest item = request.getItems().get(i);
                InvoiceItem ii = new InvoiceItem();
                ii.setInvoice(invoice);
                ii.setProductName(product.getName());
                ii.setQuantity(BigDecimal.valueOf(item.getQuantity()));
                ii.setUnit(product.getUnit());
                ii.setUnitPriceUsd(item.getUnitPriceUsd());
                ii.setLineTotalUsd(item.getUnitPriceUsd().multiply(BigDecimal.valueOf(item.getQuantity())));
                invoiceItems.add(ii);
            }
            invoice.setItems(invoiceItems);

            savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(invoiceRepository, businessId, invoice);
            Long invoiceId = savedInvoice.getId();
            for (RetailTransaction tx : transactions) {
                tx.setInvoiceId(invoiceId);
            }
            invoiceEmailService.sendIfEligible(savedInvoice, business, request.getBuyerEmail());
            if (isPickup) {
                invoiceEmailService.sendPickupNotification(savedInvoice, business, request.getBuyerEmail());
            }
        }

        List<LineItemSummary> summaries = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            POSItemRequest item = request.getItems().get(i);
            summaries.add(new LineItemSummary(
                    product.getName(),
                    BigDecimal.valueOf(item.getQuantity()),
                    product.getUnit(),
                    item.getUnitPriceUsd(),
                    item.getUnitPriceUsd().multiply(BigDecimal.valueOf(item.getQuantity()))
            ));
        }

        return new POSResponse(
                savedInvoice != null ? savedInvoice.getInvoiceNumber() : null,
                summaries,
                total,
                request.getPaymentMode(),
                "CREDIT".equals(request.getPaymentMode()) ? "UNPAID" : "PAID",
                transactions.get(0).getRecordedAt(),
                creditRecordId,
                savedInvoice != null ? savedInvoice.getPickupCode() : null
        );
    }
}
