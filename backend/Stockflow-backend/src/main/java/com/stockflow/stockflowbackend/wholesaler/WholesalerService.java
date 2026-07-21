package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.email.InvoiceEmailService;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.payment.PaystackTransactionVerifier;
import com.stockflow.stockflowbackend.pos.InvoiceNumberUtil;
import com.stockflow.stockflowbackend.pos.InvoiceRepository;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WholesalerService {

    private final WarehouseProductRepository warehouseProductRepository;
    private final ReceiptRepository receiptRepository;
    private final WholesaleSaleRepository wholesaleSaleRepository;
    private final BusinessRepository businessRepository;
    private final CreditRepository creditRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceEmailService invoiceEmailService;
    private final SubscriptionService subscriptionService;
    private final PaystackTransactionVerifier paystackTransactionVerifier;

    public WholesalerService(
            WarehouseProductRepository warehouseProductRepository,
            ReceiptRepository receiptRepository,
            WholesaleSaleRepository wholesaleSaleRepository,
            BusinessRepository businessRepository,
            CreditRepository creditRepository,
            InvoiceRepository invoiceRepository,
            InvoiceEmailService invoiceEmailService,
            SubscriptionService subscriptionService,
            PaystackTransactionVerifier paystackTransactionVerifier) {
        this.warehouseProductRepository = warehouseProductRepository;
        this.receiptRepository = receiptRepository;
        this.wholesaleSaleRepository = wholesaleSaleRepository;
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceEmailService = invoiceEmailService;
        this.subscriptionService = subscriptionService;
        this.paystackTransactionVerifier = paystackTransactionVerifier;
    }

    @Transactional
    public WarehouseProduct addProduct(AddWarehouseProductRequest request,
                                       Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        WarehouseProduct product = new WarehouseProduct();
        product.setBusiness(business);
        product.setName(request.getName());
        product.setUnit(request.getUnit());
        product.setQuantity(request.getQuantity());
        product.setMinThreshold(request.getMinThreshold());
        product.setPriceUsd(request.getPriceUsd());
        product.setUpdatedAt(LocalDateTime.now());

        return warehouseProductRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<WarehouseStockResponse> getStock(Long businessId) {
        return warehouseProductRepository.findByBusinessId(businessId)
                .stream()
                .map(p -> new WarehouseStockResponse(
                        p.getId(), p.getName(), p.getUnit(),
                        p.getQuantity(), p.getMinThreshold(), p.getPriceUsd()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Receipt receiveFromManufacturer(ReceiveStockRequest request,
                                           Long businessId, Long userId) {
        if (request.getQuantity() == null || request.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        if (request.getAmountUsd() == null || request.getAmountUsd().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Amount cannot be negative");
        }
        WarehouseProduct product = warehouseProductRepository
                .findByBusinessIdAndId(businessId, request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Business manufacturer = businessRepository
                .findById(request.getManufacturerBusinessId())
                .orElseThrow(() ->
                        new RuntimeException("Manufacturer not found"));

        product.setQuantity(
                product.getQuantity().add(request.getQuantity()));
        product.setUpdatedAt(LocalDateTime.now());
        warehouseProductRepository.save(product);

        Receipt receipt = new Receipt();
        receipt.setBusiness(product.getBusiness());
        receipt.setProduct(product);
        receipt.setQuantity(request.getQuantity());
        receipt.setManufacturerBusiness(manufacturer);
        receipt.setAmountUsd(request.getAmountUsd());
        receipt.setPaymentMode(request.getPaymentMode());

        AppUser user = new AppUser();
        user.setId(userId);
        receipt.setRecordedBy(user);

        if ("CREDIT".equals(request.getPaymentMode())
                && request.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(manufacturer);
            credit.setDebtorBusiness(product.getBusiness());
            credit.setAmountUsd(request.getAmountUsd());
            credit.setDueDate(request.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord saved = creditRepository.save(credit);
            receipt.setCreditRecordId(saved.getId());

            Invoice invoice = new Invoice();
            invoice.setSellerBusiness(manufacturer);
            invoice.setBuyerBusiness(product.getBusiness());
            invoice.setSubtotalUsd(request.getAmountUsd());
            invoice.setTotalUsd(request.getAmountUsd());
            invoice.setPaymentMode(request.getPaymentMode());
            invoice.setDueDate(request.getDueDate());
            invoice.setStatus("UNPAID");
            invoice.setCreditRecordId(saved.getId());
            invoice.setGeneratedByUser(user);
            Invoice savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(
                    invoiceRepository, request.getManufacturerBusinessId(), invoice);
            receipt.setInvoiceId(savedInvoice.getId());
            invoiceEmailService.sendIfEligible(savedInvoice, manufacturer);
        }

        return receiptRepository.save(receipt);
    }

    @Transactional
    public WholesaleSaleResponse sellToRetailer(WholesaleSaleRequest request,
                                        Long businessId, Long userId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }
        if (request.getRetailerBusinessId() == null
                && (request.getBuyerName() == null || request.getBuyerName().isBlank())) {
            throw new RuntimeException("Enter a buyer name, or select a linked retailer");
        }
        for (WholesaleSaleItemRequest item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("Quantity must be greater than zero");
            }
            if (item.getAmountUsd() == null || item.getAmountUsd().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Amount cannot be negative");
            }
        }

        List<WarehouseProduct> products = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (WholesaleSaleItemRequest item : request.getItems()) {
            WarehouseProduct product = warehouseProductRepository
                    .findByBusinessIdAndId(businessId, item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            if (product.getQuantity().compareTo(item.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock for " + product.getName()
                        + ". Available: " + product.getQuantity());
            }
            products.add(product);
            total = total.add(item.getAmountUsd());
        }

        if ("CARD".equals(request.getPaymentMode())) {
            paystackTransactionVerifier.verifyPaid(request.getPaystackReference(), total);
        }

        Business retailer = null;
        if (request.getRetailerBusinessId() != null) {
            retailer = businessRepository
                    .findById(request.getRetailerBusinessId())
                    .orElseThrow(() -> new RuntimeException("Retailer not found"));
        }

        for (int i = 0; i < products.size(); i++) {
            WarehouseProduct product = products.get(i);
            BigDecimal requested = request.getItems().get(i).getQuantity();
            product.setQuantity(product.getQuantity().subtract(requested));
            product.setUpdatedAt(LocalDateTime.now());
            warehouseProductRepository.save(product);
        }

        Business business = products.get(0).getBusiness();
        AppUser user = new AppUser();
        user.setId(userId);

        Long creditRecordId = null;
        if ("CREDIT".equals(request.getPaymentMode())
                && request.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(business);
            if (retailer != null) {
                credit.setDebtorBusiness(retailer);
            } else {
                credit.setDebtorName(request.getBuyerName());
            }
            credit.setAmountUsd(total);
            credit.setDueDate(request.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord saved = creditRepository.save(credit);
            creditRecordId = saved.getId();
        }

        List<WholesaleSale> sales = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            WarehouseProduct product = products.get(i);
            WholesaleSaleItemRequest item = request.getItems().get(i);
            WholesaleSale sale = new WholesaleSale();
            sale.setBusiness(business);
            sale.setProduct(product);
            sale.setQuantity(item.getQuantity());
            sale.setRetailerBusiness(retailer);
            sale.setBuyerName(retailer != null ? null : request.getBuyerName());
            sale.setAmountUsd(item.getAmountUsd());
            sale.setPaymentMode(request.getPaymentMode());
            sale.setRecordedBy(user);
            sale.setCreditRecordId(creditRecordId);
            sales.add(sale);
        }

        // Standard tier always gets an invoice; Premium can be asked per-sale
        // whether the buyer wants one at all.
        boolean canSkipInvoice = subscriptionService.hasFeature(
                business, SubscriptionFeature.INVOICE_ON_DEMAND);
        boolean wantsInvoice = request.getWantsInvoice() == null || request.getWantsInvoice();

        Invoice savedInvoice = null;
        if (!canSkipInvoice || wantsInvoice) {
            Invoice invoice = new Invoice();
            invoice.setSellerBusiness(business);
            if (retailer != null) {
                invoice.setBuyerBusiness(retailer);
            } else {
                invoice.setBuyerName(request.getBuyerName());
            }
            invoice.setSubtotalUsd(total);
            invoice.setTotalUsd(total);
            invoice.setPaymentMode(request.getPaymentMode());
            invoice.setStatus("CREDIT".equals(request.getPaymentMode()) ? "UNPAID" : "PAID");
            if (request.getDueDate() != null) {
                invoice.setDueDate(request.getDueDate());
            }
            invoice.setCreditRecordId(creditRecordId);
            invoice.setGeneratedByUser(user);
            boolean isPickup = Boolean.TRUE.equals(request.getIsPickup())
                    && request.getBuyerEmail() != null && !request.getBuyerEmail().isBlank();
            if (isPickup) {
                invoice.setPickupCode(com.stockflow.stockflowbackend.email.PickupCodeUtil.generate());
            }

            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (int i = 0; i < products.size(); i++) {
                WarehouseProduct product = products.get(i);
                WholesaleSaleItemRequest item = request.getItems().get(i);
                InvoiceItem ii = new InvoiceItem();
                ii.setInvoice(invoice);
                ii.setProductName(product.getName());
                ii.setQuantity(item.getQuantity());
                ii.setUnit(product.getUnit());
                ii.setUnitPriceUsd(item.getQuantity().compareTo(BigDecimal.ZERO) > 0
                        ? item.getAmountUsd().divide(item.getQuantity(), 4, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO);
                ii.setLineTotalUsd(item.getAmountUsd());
                invoiceItems.add(ii);
            }
            invoice.setItems(invoiceItems);

            savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(invoiceRepository, businessId, invoice);
            Long invoiceId = savedInvoice.getId();
            for (WholesaleSale sale : sales) {
                sale.setInvoiceId(invoiceId);
            }
            invoiceEmailService.sendIfEligible(savedInvoice, business);
            if (isPickup) {
                invoiceEmailService.sendPickupNotification(savedInvoice, business, request.getBuyerEmail());
            }
        }

        for (WholesaleSale sale : sales) {
            wholesaleSaleRepository.save(sale);
        }

        List<LineItemSummary> summaries = new ArrayList<>();
        for (int i = 0; i < products.size(); i++) {
            WarehouseProduct product = products.get(i);
            WholesaleSaleItemRequest item = request.getItems().get(i);
            BigDecimal unitPrice = item.getQuantity().compareTo(BigDecimal.ZERO) > 0
                    ? item.getAmountUsd().divide(item.getQuantity(), 4, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            summaries.add(new LineItemSummary(product.getName(), item.getQuantity(),
                    product.getUnit(), unitPrice, item.getAmountUsd()));
        }

        return new WholesaleSaleResponse(
                savedInvoice != null ? savedInvoice.getInvoiceNumber() : null,
                summaries, total, request.getPaymentMode(),
                "CREDIT".equals(request.getPaymentMode()) ? "UNPAID" : "PAID",
                sales.get(0).getSoldAt(), creditRecordId,
                savedInvoice != null ? savedInvoice.getPickupCode() : null
        );
    }
}