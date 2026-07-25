package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.activity.ActivityLogService;
import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.email.InvoiceEmailService;
import com.stockflow.stockflowbackend.model.*;
import com.stockflow.stockflowbackend.notification.NotificationService;
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
public class ManufacturerService {

    private final MaterialRepository materialRepository;
    private final RecipeRepository recipeRepository;
    private final ProductionRunRepository productionRunRepository;
    private final FinishedGoodsRepository finishedGoodsRepository;
    private final DispatchRepository dispatchRepository;
    private final RecipeMaterialRepository recipeMaterialRepository;
    private final BusinessRepository businessRepository;
    private final CreditRepository creditRepository;
    private final NotificationService notificationService;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceEmailService invoiceEmailService;
    private final SubscriptionService subscriptionService;
    private final PaystackTransactionVerifier paystackTransactionVerifier;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    public ManufacturerService(MaterialRepository materialRepository,
                               RecipeRepository recipeRepository,
                               ProductionRunRepository productionRunRepository,
                               FinishedGoodsRepository finishedGoodsRepository,
                               DispatchRepository dispatchRepository,
                               RecipeMaterialRepository recipeMaterialRepository,
                               BusinessRepository businessRepository,
                               CreditRepository creditRepository,
                               NotificationService notificationService,
                               InvoiceRepository invoiceRepository,
                               InvoiceEmailService invoiceEmailService,
                               SubscriptionService subscriptionService,
                               PaystackTransactionVerifier paystackTransactionVerifier,
                               UserRepository userRepository,
                               ActivityLogService activityLogService) {
        this.materialRepository = materialRepository;
        this.recipeRepository = recipeRepository;
        this.productionRunRepository = productionRunRepository;
        this.finishedGoodsRepository = finishedGoodsRepository;
        this.dispatchRepository = dispatchRepository;
        this.recipeMaterialRepository = recipeMaterialRepository;
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.paystackTransactionVerifier = paystackTransactionVerifier;
        this.notificationService = notificationService;
        this.invoiceRepository = invoiceRepository;
        this.invoiceEmailService = invoiceEmailService;
        this.subscriptionService = subscriptionService;
        this.userRepository = userRepository;
        this.activityLogService = activityLogService;
    }

    // ADD MATERIAL
    @Transactional
    public Material addMaterial(AddMaterialRequest req, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        Material m = new Material();
        m.setBusiness(business);
        m.setName(req.getName());
        m.setUnit(req.getUnit());
        m.setQuantity(req.getQuantity());
        m.setMinThreshold(req.getMinThreshold());
        m.setCostPerUnit(req.getCostPerUnit());
        m.setUpdatedAt(LocalDateTime.now());
        return materialRepository.save(m);
    }

    // GET ALL MATERIALS
    @Transactional(readOnly = true)
    public List<Material> getMaterials(Long businessId) {
        return materialRepository.findByBusinessId(businessId);
    }

    // DELETE MATERIAL
    @Transactional
    public void deleteMaterial(Long materialId, Long businessId) {
        Material m = materialRepository
                .findByBusinessIdAndId(businessId, materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));
        materialRepository.delete(m);
    }

    // STOCK IN MATERIAL
    @Transactional
    public Material stockInMaterial(MaterialStockInRequest req, Long businessId) {
        if (req.getQuantity() == null || req.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity must be greater than zero");
        }
        Material m = materialRepository
                .findByBusinessIdAndId(businessId, req.getMaterialId())
                .orElseThrow(() -> new RuntimeException("Material not found"));
        m.setQuantity(m.getQuantity().add(req.getQuantity()));
        m.setUpdatedAt(LocalDateTime.now());
        return materialRepository.save(m);
    }

    // CREATE RECIPE
    @Transactional
    public Recipe createRecipe(CreateRecipeRequest req, Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        Recipe recipe = new Recipe();
        recipe.setBusiness(business);
        recipe.setProductName(req.getProductName());
        recipe.setUnitLabel(req.getUnitLabel());
        recipe.setGroupLabel(req.getGroupLabel());
        recipe.setUnitsPerGroup(req.getUnitsPerGroup());
        recipe.setIsActive(true);
        Recipe saved = recipeRepository.save(recipe);

        if (req.getMaterials() != null) {
            for (CreateRecipeRequest.RecipeMaterialItem item : req.getMaterials()) {
                Material material = materialRepository.findByBusinessIdAndId(businessId, item.getMaterialId())
                        .orElseThrow(() -> new RuntimeException("Material not found"));
                RecipeMaterial rm = new RecipeMaterial();
                rm.setRecipe(saved);
                rm.setMaterial(material);
                rm.setQuantityPerUnit(item.getQuantityPerUnit());
                recipeMaterialRepository.save(rm);
            }
        }
        return saved;
    }

    // PRODUCTION CALCULATE
    @Transactional(readOnly = true)
    public ProductionPreview calculate(ProductionCalculateRequest req, Long businessId) {
        if (req.getTargetGroups() == null || req.getTargetGroups() <= 0) {
            throw new RuntimeException("Target groups must be greater than zero");
        }
        Recipe recipe = recipeRepository
                .findByBusinessIdAndId(businessId, req.getRecipeId())
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        int totalUnits = req.getTargetGroups() * recipe.getUnitsPerGroup();
        List<MaterialResult> results = recipe.getMaterials().stream().map(rm -> {
            BigDecimal required = rm.getQuantityPerUnit()
                    .multiply(BigDecimal.valueOf(totalUnits));
            BigDecimal inStock = rm.getMaterial().getQuantity();
            return new MaterialResult(rm.getMaterial().getId(),
                    rm.getMaterial().getName(), rm.getMaterial().getUnit(),
                    required, inStock);
        }).collect(Collectors.toList());
        boolean feasible = results.stream().allMatch(MaterialResult::getSufficient);
        return new ProductionPreview(totalUnits, results, feasible);
    }

    // PRODUCTION CONFIRM
    @Transactional
    public ProductionRun confirmProduction(ProductionCalculateRequest req,
                                           Long businessId, Long userId) {
        ProductionPreview preview = calculate(req, businessId);
        if (!preview.getFeasible()) {
            throw new RuntimeException("Cannot confirm;Insufficient materials");
        }
        Recipe recipe = recipeRepository
                .findByBusinessIdAndId(businessId, req.getRecipeId()).orElseThrow();
        int totalUnits = req.getTargetGroups() * recipe.getUnitsPerGroup();
        BigDecimal totalCost = BigDecimal.ZERO;
        for (RecipeMaterial rm : recipe.getMaterials()) {
            BigDecimal required = rm.getQuantityPerUnit()
                    .multiply(BigDecimal.valueOf(totalUnits));
            Material mat = rm.getMaterial();
            mat.setQuantity(mat.getQuantity().subtract(required));
            mat.setUpdatedAt(LocalDateTime.now());
            materialRepository.save(mat);
            if (mat.getCostPerUnit() != null) {
                totalCost = totalCost.add(mat.getCostPerUnit().multiply(required));
            }
        }
        Business business = businessRepository.findById(businessId).orElseThrow();
        AppUser user = new AppUser(); user.setId(userId);
        ProductionRun run = new ProductionRun();
        run.setBusiness(business); run.setRecipe(recipe);
        run.setTargetGroups(req.getTargetGroups());
        run.setTotalUnits(totalUnits); run.setTotalCostUsd(totalCost);
        run.setConfirmedBy(user);
        ProductionRun savedRun = productionRunRepository.save(run);
        FinishedGoods fg = finishedGoodsRepository
                .findByBusinessIdAndRecipeId(businessId, recipe.getId())
                .orElseGet(() -> { FinishedGoods newFg = new FinishedGoods();
                    newFg.setBusiness(business); newFg.setRecipe(recipe);
                    newFg.setQuantityInStock(0); return newFg; });
        fg.setQuantityInStock(fg.getQuantityInStock() + totalUnits);
        fg.setUpdatedAt(LocalDateTime.now());
        finishedGoodsRepository.save(fg);

        AppUser actor = userRepository.findById(userId).orElse(null);
        activityLogService.log(business, actor, "PRODUCTION",
                "Produced " + totalUnits + " units of " + recipe.getProductName()
                        + " (consumed " + recipe.getMaterials().size() + " material" + (recipe.getMaterials().size() != 1 ? "s" : "") + ")",
                totalCost);

        return savedRun;
    }

    // GET FINISHED GOODS
    @Transactional(readOnly = true)
    public List<FinishedGoods> getFinishedGoods(Long businessId) {
        return finishedGoodsRepository.findByBusinessId(businessId);
    }

    // DISPATCH TO WHOLESALER
    @Transactional
    public DispatchResponse dispatch(DispatchRequest req, Long businessId, Long userId) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("At least one item is required");
        }
        if (req.getWholesalerBusinessId() == null
                && (req.getBuyerName() == null || req.getBuyerName().isBlank())) {
            throw new RuntimeException("Enter a buyer name, or select a linked wholesaler");
        }
        if ("MOBILE_MONEY".equals(req.getPaymentMode())
                && (req.getMobileMoneyNumber() == null || req.getMobileMoneyNumber().isBlank())) {
            throw new RuntimeException("Mobile money number is required for this payment mode");
        }
        for (DispatchItemRequest item : req.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be greater than zero");
            }
            if (item.getAmountUsd() == null || item.getAmountUsd().compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Amount cannot be negative");
            }
        }

        List<FinishedGoods> goods = new ArrayList<>();
        BigDecimal itemsTotal = BigDecimal.ZERO;
        for (DispatchItemRequest item : req.getItems()) {
            FinishedGoods fg = finishedGoodsRepository.findByBusinessIdAndId(businessId, item.getFinishedGoodId())
                    .orElseThrow(() -> new RuntimeException("Finished goods not found"));
            if (fg.getQuantityInStock() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for " + fg.getRecipe().getProductName());
            }
            goods.add(fg);
            itemsTotal = itemsTotal.add(item.getAmountUsd());
        }

        Business wholesaler = null;
        if (req.getWholesalerBusinessId() != null) {
            wholesaler = businessRepository
                    .findById(req.getWholesalerBusinessId())
                    .orElseThrow(() -> new RuntimeException("Wholesaler not found"));
        }

        String deliveryMode = "PICKUP".equals(req.getDeliveryMode()) ? "PICKUP" : "DELIVERY";
        BigDecimal deliveryFee = "DELIVERY".equals(deliveryMode) && req.getDeliveryFeeUsd() != null
                ? req.getDeliveryFeeUsd() : BigDecimal.ZERO;
        BigDecimal totalAmount = itemsTotal.add(deliveryFee);

        if ("CARD".equals(req.getPaymentMode())) {
            paystackTransactionVerifier.verifyPaid(req.getPaystackReference(), totalAmount);
        }

        for (int i = 0; i < goods.size(); i++) {
            FinishedGoods fg = goods.get(i);
            fg.setQuantityInStock(fg.getQuantityInStock() - req.getItems().get(i).getQuantity());
            fg.setUpdatedAt(LocalDateTime.now());
            finishedGoodsRepository.save(fg);
        }

        Business business = goods.get(0).getBusiness();
        AppUser user = new AppUser(); user.setId(userId);

        Long creditRecordId = null;
        if ("CREDIT".equals(req.getPaymentMode()) && req.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(business);
            if (wholesaler != null) {
                credit.setDebtorBusiness(wholesaler);
            } else {
                credit.setDebtorName(req.getBuyerName());
            }
            credit.setAmountUsd(totalAmount);
            credit.setDueDate(req.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord saved = creditRepository.save(credit);
            creditRecordId = saved.getId();
        }

        List<Dispatch> dispatches = new ArrayList<>();
        for (int i = 0; i < goods.size(); i++) {
            FinishedGoods fg = goods.get(i);
            DispatchItemRequest item = req.getItems().get(i);
            Dispatch dispatch = new Dispatch();
            dispatch.setBusiness(business);
            dispatch.setFinishedGood(fg);
            dispatch.setWholesalerBusiness(wholesaler);
            dispatch.setBuyerName(wholesaler != null ? null : req.getBuyerName());
            dispatch.setQuantity(item.getQuantity());
            // Delivery fee (if any) is only carried on the first line so it isn't
            // double-counted when the dispatch total is summed across rows.
            dispatch.setAmountUsd(i == 0 ? item.getAmountUsd().add(deliveryFee) : item.getAmountUsd());
            dispatch.setPaymentMode(req.getPaymentMode());
            dispatch.setMobileMoneyNumber(req.getMobileMoneyNumber());
            dispatch.setRecordedBy(user);
            dispatch.setDeliveryMode(deliveryMode);
            dispatch.setDeliveryFeeUsd(i == 0 && deliveryFee.compareTo(BigDecimal.ZERO) > 0 ? deliveryFee : null);
            dispatch.setDriverName(req.getDriverName());
            dispatch.setVehicleNumber(req.getVehicleNumber());
            dispatch.setDriverContact(req.getDriverContact());
            dispatch.setDriverIdNumber(req.getDriverIdNumber());
            dispatch.setCreditRecordId(creditRecordId);
            dispatches.add(dispatch);
        }

        // Standard tier always gets an invoice; Premium can be asked per-dispatch
        // whether the buyer wants one at all.
        boolean canSkipInvoice = subscriptionService.hasFeature(
                business, SubscriptionFeature.INVOICE_ON_DEMAND);
        boolean wantsInvoice = req.getWantsInvoice() == null || req.getWantsInvoice();

        Invoice savedInvoice = null;
        if (!canSkipInvoice || wantsInvoice) {
            Invoice invoice = new Invoice();
            invoice.setSellerBusiness(business);
            if (wholesaler != null) {
                invoice.setBuyerBusiness(wholesaler);
            } else {
                invoice.setBuyerName(req.getBuyerName());
            }
            invoice.setSubtotalUsd(itemsTotal);
            invoice.setTotalUsd(totalAmount);
            invoice.setPaymentMode(req.getPaymentMode());
            invoice.setStatus("CREDIT".equals(req.getPaymentMode()) ? "UNPAID" : "PAID");
            if (req.getDueDate() != null) {
                invoice.setDueDate(req.getDueDate());
            }
            invoice.setCreditRecordId(creditRecordId);
            invoice.setGeneratedByUser(user);
            boolean isPickup = "PICKUP".equals(deliveryMode)
                    && req.getBuyerEmail() != null && !req.getBuyerEmail().isBlank();
            if (isPickup) {
                invoice.setPickupCode(com.stockflow.stockflowbackend.email.PickupCodeUtil.generate());
            }

            List<InvoiceItem> invoiceItems = new ArrayList<>();
            for (int i = 0; i < goods.size(); i++) {
                FinishedGoods fg = goods.get(i);
                DispatchItemRequest item = req.getItems().get(i);
                InvoiceItem ii = new InvoiceItem();
                ii.setInvoice(invoice);
                ii.setProductName(fg.getRecipe().getProductName());
                ii.setQuantity(BigDecimal.valueOf(item.getQuantity()));
                ii.setUnit(fg.getRecipe().getUnitLabel());
                ii.setUnitPriceUsd(item.getQuantity() > 0
                        ? item.getAmountUsd().divide(BigDecimal.valueOf(item.getQuantity()), 4, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO);
                ii.setLineTotalUsd(item.getAmountUsd());
                invoiceItems.add(ii);
            }
            if (deliveryFee.compareTo(BigDecimal.ZERO) > 0) {
                InvoiceItem feeItem = new InvoiceItem();
                feeItem.setInvoice(invoice);
                feeItem.setProductName("Delivery fee");
                feeItem.setQuantity(BigDecimal.ONE);
                feeItem.setUnit("fee");
                feeItem.setUnitPriceUsd(deliveryFee);
                feeItem.setLineTotalUsd(deliveryFee);
                invoiceItems.add(feeItem);
            }
            invoice.setItems(invoiceItems);

            savedInvoice = InvoiceNumberUtil.saveWithUniqueNumber(invoiceRepository, businessId, invoice);
            Long invoiceId = savedInvoice.getId();
            for (Dispatch dispatch : dispatches) {
                dispatch.setInvoiceId(invoiceId);
            }
            invoiceEmailService.sendIfEligible(savedInvoice, business, req.getBuyerEmail());
            if (isPickup) {
                invoiceEmailService.sendPickupNotification(savedInvoice, business, req.getBuyerEmail());
            }
        }

        for (Dispatch dispatch : dispatches) {
            dispatchRepository.save(dispatch);
        }

        String productList = goods.stream().map(fg -> fg.getRecipe().getProductName())
                .distinct().collect(Collectors.joining(", "));
        if (wholesaler != null) {
            notificationService.notify(wholesaler, "DISPATCH_RECEIVED", "info",
                    "Incoming dispatch",
                    business.getName() + " dispatched " + productList + " to you");
        }

        List<LineItemSummary> summaries = new ArrayList<>();
        for (int i = 0; i < goods.size(); i++) {
            FinishedGoods fg = goods.get(i);
            DispatchItemRequest item = req.getItems().get(i);
            BigDecimal unitPrice = item.getQuantity() > 0
                    ? item.getAmountUsd().divide(BigDecimal.valueOf(item.getQuantity()), 4, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            summaries.add(new LineItemSummary(fg.getRecipe().getProductName(),
                    BigDecimal.valueOf(item.getQuantity()), fg.getRecipe().getUnitLabel(),
                    unitPrice, item.getAmountUsd()));
        }

        AppUser actor = userRepository.findById(userId).orElse(null);
        String dispatchBuyerLabel = wholesaler != null ? wholesaler.getName() : req.getBuyerName();
        activityLogService.log(business, actor, "DISPATCH",
                "Dispatched " + productList + " to " + dispatchBuyerLabel + " via " + req.getPaymentMode(),
                totalAmount);

        return new DispatchResponse(
                savedInvoice != null ? savedInvoice.getInvoiceNumber() : null,
                summaries, deliveryFee, totalAmount, req.getPaymentMode(),
                "CREDIT".equals(req.getPaymentMode()) ? "UNPAID" : "PAID",
                dispatches.get(0).getDispatchedAt(), creditRecordId,
                savedInvoice != null ? savedInvoice.getPickupCode() : null
        );
    }

    @Transactional(readOnly = true)
    public List<Recipe> getRecipes(Long businessId) {
        return recipeRepository.findByBusinessIdAndIsActiveTrue(businessId);
    }

    // DELETE RECIPE (soft delete — production history may still reference it)
    @Transactional
    public void deleteRecipe(Long recipeId, Long businessId) {
        Recipe recipe = recipeRepository
                .findByBusinessIdAndId(businessId, recipeId)
                .orElseThrow(() -> new RuntimeException("Recipe not found"));
        recipe.setIsActive(false);
        recipeRepository.save(recipe);
    }

    @Transactional(readOnly = true)
    public List<ProductionRun> getProductionHistory(Long businessId) {
        return productionRunRepository.findByBusinessIdOrderByConfirmedAtDesc(businessId);
    }
}