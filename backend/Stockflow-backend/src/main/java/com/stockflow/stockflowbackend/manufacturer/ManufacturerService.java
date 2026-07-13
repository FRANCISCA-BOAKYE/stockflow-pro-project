package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    public ManufacturerService(MaterialRepository materialRepository,
                               RecipeRepository recipeRepository,
                               ProductionRunRepository productionRunRepository,
                               FinishedGoodsRepository finishedGoodsRepository,
                               DispatchRepository dispatchRepository,
                               RecipeMaterialRepository recipeMaterialRepository,
                               BusinessRepository businessRepository,
                               CreditRepository creditRepository) {
        this.materialRepository = materialRepository;
        this.recipeRepository = recipeRepository;
        this.productionRunRepository = productionRunRepository;
        this.finishedGoodsRepository = finishedGoodsRepository;
        this.dispatchRepository = dispatchRepository;
        this.recipeMaterialRepository = recipeMaterialRepository;
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
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
                Material material = materialRepository.findById(item.getMaterialId())
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
        return savedRun;
    }

    // GET FINISHED GOODS
    @Transactional(readOnly = true)
    public List<FinishedGoods> getFinishedGoods(Long businessId) {
        return finishedGoodsRepository.findByBusinessId(businessId);
    }

    // DISPATCH TO WHOLESALER
    @Transactional
    public Dispatch dispatch(DispatchRequest req, Long businessId, Long userId) {
        FinishedGoods fg = finishedGoodsRepository.findById(req.getFinishedGoodId())
                .orElseThrow(() -> new RuntimeException("Finished goods not found"));
        if (fg.getQuantityInStock() < req.getQuantity()) {
            throw new RuntimeException("Insufficient finished goods");
        }
        Business wholesaler = businessRepository
                .findById(req.getWholesalerBusinessId())
                .orElseThrow(() -> new RuntimeException("Wholesaler not found"));
        fg.setQuantityInStock(fg.getQuantityInStock() - req.getQuantity());
        fg.setUpdatedAt(LocalDateTime.now());
        finishedGoodsRepository.save(fg);
        AppUser user = new AppUser(); user.setId(userId);
        Dispatch dispatch = new Dispatch();
        dispatch.setBusiness(fg.getBusiness());
        dispatch.setFinishedGood(fg);
        dispatch.setWholesalerBusiness(wholesaler);
        dispatch.setQuantity(req.getQuantity());
        dispatch.setAmountUsd(req.getAmountUsd());
        dispatch.setPaymentMode(req.getPaymentMode());
        dispatch.setRecordedBy(user);
        if ("CREDIT".equals(req.getPaymentMode()) && req.getDueDate() != null) {
            CreditRecord credit = new CreditRecord();
            credit.setCreditorBusiness(fg.getBusiness());
            credit.setDebtorBusiness(wholesaler);
            credit.setAmountUsd(req.getAmountUsd());
            credit.setDueDate(req.getDueDate());
            credit.setStatus("OUTSTANDING");
            credit.setHoldPlaced(false);
            CreditRecord saved = creditRepository.save(credit);
            dispatch.setCreditRecordId(saved.getId());
        }
        return dispatchRepository.save(dispatch);
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