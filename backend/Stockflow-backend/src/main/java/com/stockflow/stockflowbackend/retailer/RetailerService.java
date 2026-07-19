package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RetailerService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RetailTransactionRepository transactionRepository;
    private final BusinessRepository businessRepository;
    private final CreditRepository creditRepository;

    public RetailerService(ProductRepository productRepository,
                           CategoryRepository categoryRepository,
                           RetailTransactionRepository transactionRepository,
                           BusinessRepository businessRepository,
                           CreditRepository creditRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
    }

    @Transactional
    public ProductResponse addProduct(AddProductRequest request,
                                      Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        Product product = new Product();
        product.setBusiness(business);
        product.setName(request.getName());
        product.setPriceUsd(request.getPriceUsd());
        product.setQuantity(request.getQuantity());
        product.setMinThreshold(request.getMinThreshold());
        product.setUnit(request.getUnit() != null ? request.getUnit() : "pcs");
        product.setIsActive(true);

        if (request.getCategoryId() != null) {
            Category category = categoryRepository
                    .findByBusinessIdAndId(businessId, request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        String categoryName = saved.getCategory() != null
                ? saved.getCategory().getName() : null;

        return new ProductResponse(saved.getId(), saved.getName(),
                categoryName, saved.getUnit(), saved.getPriceUsd(),
                saved.getQuantity(), saved.getMinThreshold(),
                saved.getIsActive());
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Long businessId, String search,
                                             Long categoryId, int page,
                                             int size) {
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by("name").ascending());

        Page<Product> products;

        if (search != null && !search.isEmpty()) {
            products = productRepository
                    .findByBusinessIdAndIsActiveTrueAndNameContainingIgnoreCase(
                            businessId, search, pageable);
        } else if (categoryId != null) {
            products = productRepository
                    .findByBusinessIdAndIsActiveTrueAndCategoryId(
                            businessId, categoryId, pageable);
        } else {
            products = productRepository
                    .findByBusinessIdAndIsActiveTrue(businessId, pageable);
        }

        return products.map(p -> new ProductResponse(
                p.getId(), p.getName(),
                p.getCategory() != null ? p.getCategory().getName() : null,
                p.getUnit(), p.getPriceUsd(), p.getQuantity(),
                p.getMinThreshold(), p.getIsActive()));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts(Long businessId) {
        return productRepository
                .findLowStock(businessId)
                .stream()
                .map(p -> new ProductResponse(p.getId(), p.getName(),
                        p.getCategory() != null
                                ? p.getCategory().getName() : null,
                        p.getUnit(), p.getPriceUsd(), p.getQuantity(),
                        p.getMinThreshold(), p.getIsActive()))
                .collect(Collectors.toList());
    }

    @Transactional
    public RetailTransaction stockIn(StockInRequest request,
                                     Long businessId, Long userId) {
        if (request.getQuantity() == null || request.getQuantity().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.getBusiness().getId().equals(businessId)) {
            throw new RuntimeException(
                    "Product does not belong to this business");
        }

        product.setQuantity(
                product.getQuantity().add(request.getQuantity()));
        product.setUpdatedAt(LocalDateTime.now());
        productRepository.save(product);

        RetailTransaction tx = new RetailTransaction();
        tx.setBusiness(product.getBusiness());
        tx.setProduct(product);
        tx.setType("IN");
        tx.setQuantity(request.getQuantity());
        tx.setAmountUsd(request.getAmountUsd());
        tx.setPaymentMode(request.getPaymentMode());

        AppUser user = new AppUser();
        user.setId(userId);
        tx.setRecordedBy(user);

        if (request.getWholesalerBusinessId() != null) {
            Business wholesaler = businessRepository
                    .findById(request.getWholesalerBusinessId())
                    .orElseThrow(() ->
                            new RuntimeException("Wholesaler not found"));
            tx.setWholesalerBusiness(wholesaler);

            if ("CREDIT".equals(request.getPaymentMode())
                    && request.getDueDate() != null) {
                CreditRecord credit = new CreditRecord();
                credit.setCreditorBusiness(wholesaler);
                credit.setDebtorBusiness(product.getBusiness());
                credit.setAmountUsd(request.getAmountUsd());
                credit.setDueDate(request.getDueDate());
                credit.setStatus("OUTSTANDING");
                credit.setHoldPlaced(false);
                CreditRecord savedCredit = creditRepository.save(credit);
                tx.setCreditRecordId(savedCredit.getId());
            }
        }

        return transactionRepository.save(tx);
    }

    @Transactional(readOnly = true)
    public List<Category> getCategories(Long businessId) {
        return categoryRepository.findByBusinessId(businessId);
    }

    @Transactional
    public Category addCategory(String name, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        Category category = new Category();
        category.setBusiness(business);
        category.setName(name);
        return categoryRepository.save(category);
    }
}