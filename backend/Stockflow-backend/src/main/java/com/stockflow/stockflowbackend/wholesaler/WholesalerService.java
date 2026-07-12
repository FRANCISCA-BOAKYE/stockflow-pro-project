package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.email.InvoiceEmailService;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.pos.InvoiceNumberUtil;
import com.stockflow.stockflowbackend.pos.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    public WholesalerService(
            WarehouseProductRepository warehouseProductRepository,
            ReceiptRepository receiptRepository,
            WholesaleSaleRepository wholesaleSaleRepository,
            BusinessRepository businessRepository,
            CreditRepository creditRepository,
            InvoiceRepository invoiceRepository,
            InvoiceEmailService invoiceEmailService) {
        this.warehouseProductRepository = warehouseProductRepository;
        this.receiptRepository = receiptRepository;
        this.wholesaleSaleRepository = wholesaleSaleRepository;
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.invoiceRepository = invoiceRepository;
        this.invoiceEmailService = invoiceEmailService;
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
        product.setUpdatedAt(LocalDateTime.now());

        return warehouseProductRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<WarehouseStockResponse> getStock(Long businessId) {
        return warehouseProductRepository.findByBusinessId(businessId)
                .stream()
                .map(p -> new WarehouseStockResponse(
                        p.getId(), p.getName(), p.getUnit(),
                        p.getQuantity(), p.getMinThreshold()))
                .collect(Collectors.toList());
    }

    @Transactional
    public Receipt receiveFromManufacturer(ReceiveStockRequest request,
                                           Long businessId, Long userId) {
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
    public WholesaleSale sellToRetailer(WholesaleSaleRequest request,
                                        Long businessId, Long userId) {
        WarehouseProduct product = warehouseProductRepository
                .findByBusinessIdAndId(businessId, request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getQuantity().compareTo(request.getQuantity()) < 0) {
            throw new RuntimeException("Insufficient stock. Available: "
                    + product.getQuantity());
        }

        Business retailer = businessRepository
                .findById(request.getRetailerBusinessId())
                .orElseThrow(() ->
                        new RuntimeException("Retailer not found"));

        product.setQuantity(
                product.getQuantity().subtract(request.getQuantity()));
        product.setUpdatedAt(LocalDateTime.now());
        warehouseProductRepository.save(product);

        WholesaleSale sale = new WholesaleSale();
        sale.setBusiness(product.getBusiness());
        sale.setProduct(product);
        sale.setQuantity(request.getQuantity());
        sale.setRetailerBusiness(retailer);
        sale.setAmountUsd(request.getAmountUsd());
        sale.setPaymentMode(request.getPaymentMode());

        AppUser user = new AppUser();
        user.setId(userId);
        sale.setRecordedBy(user);

        if ("CREDIT".equals(request.getPaymentMode())
                && request.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(product.getBusiness());
            credit.setDebtorBusiness(retailer);
            credit.setAmountUsd(request.getAmountUsd());
            credit.setDueDate(request.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord saved = creditRepository.save(credit);
            sale.setCreditRecordId(saved.getId());

            Invoice invoice = new Invoice();
            invoice.setSellerBusiness(product.getBusiness());
            invoice.setBuyerBusiness(retailer);
            invoice.setSubtotalUsd(request.getAmountUsd());
            invoice.setTotalUsd(request.getAmountUsd());
            invoice.setPaymentMode(request.getPaymentMode());
            invoice.setDueDate(request.getDueDate());
            invoice.setStatus("UNPAID");
            invoice.setCreditRecordId(saved.getId());
            invoice.setGeneratedByUser(user);
            Invoice savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(
                    invoiceRepository, businessId, invoice);
            sale.setInvoiceId(savedInvoice.getId());
            invoiceEmailService.sendIfEligible(savedInvoice, product.getBusiness());
        }

        return wholesaleSaleRepository.save(sale);
    }
}