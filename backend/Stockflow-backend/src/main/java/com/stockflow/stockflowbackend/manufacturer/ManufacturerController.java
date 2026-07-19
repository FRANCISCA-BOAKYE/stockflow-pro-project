package com.stockflow.stockflowbackend.manufacturer;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/manufacturer")
public class ManufacturerController {

    private final ManufacturerService manufacturerService;

    public ManufacturerController(ManufacturerService manufacturerService) {
        this.manufacturerService = manufacturerService;
    }

    private Long getBusinessId(Authentication auth) {
        return (Long) auth.getDetails();
    }

    private Long getUserId(Authentication auth) {
        return (Long) auth.getCredentials();
    }

    @GetMapping("/materials")
    public ResponseEntity<List<Material>> getMaterials(Authentication auth) {
        return ResponseEntity.ok(manufacturerService.getMaterials(getBusinessId(auth)));
    }

    @PostMapping("/materials")
    public ResponseEntity<Material> addMaterial(
            @RequestBody AddMaterialRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.addMaterial(req, getBusinessId(auth)));
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<?> deleteMaterial(@PathVariable Long id, Authentication auth) {
        manufacturerService.deleteMaterial(id, getBusinessId(auth));
        return ResponseEntity.ok(java.util.Map.of("message", "Material deleted"));
    }

    @PostMapping("/materials/stock-in")
    public ResponseEntity<Material> stockIn(
            @RequestBody MaterialStockInRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.stockInMaterial(req, getBusinessId(auth)));
    }

    @GetMapping("/recipes")
    public ResponseEntity<List<Recipe>> getRecipes(Authentication auth) {
        return ResponseEntity.ok(manufacturerService.getRecipes(getBusinessId(auth)));
    }

    @PostMapping("/recipes")
    public ResponseEntity<Recipe> createRecipe(
            @RequestBody CreateRecipeRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.createRecipe(req, getBusinessId(auth)));
    }

    @DeleteMapping("/recipes/{id}")
    public ResponseEntity<?> deleteRecipe(@PathVariable Long id, Authentication auth) {
        manufacturerService.deleteRecipe(id, getBusinessId(auth));
        return ResponseEntity.ok(java.util.Map.of("message", "Recipe deleted"));
    }

    @PostMapping("/production/calculate")
    public ResponseEntity<ProductionPreview> calculate(
            @RequestBody ProductionCalculateRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.calculate(req, getBusinessId(auth)));
    }

    @PostMapping("/production/confirm")
    public ResponseEntity<ProductionRun> confirm(
            @RequestBody ProductionCalculateRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.confirmProduction(
                req, getBusinessId(auth), getUserId(auth)));
    }

    @GetMapping("/production/history")
    public ResponseEntity<List<ProductionRun>> history(Authentication auth) {
        return ResponseEntity.ok(manufacturerService.getProductionHistory(getBusinessId(auth)));
    }

    @GetMapping("/finished-goods")
    public ResponseEntity<List<FinishedGoods>> finishedGoods(Authentication auth) {
        return ResponseEntity.ok(manufacturerService.getFinishedGoods(getBusinessId(auth)));
    }

    @PostMapping("/dispatch")
    public ResponseEntity<DispatchResponse> dispatch(
            @RequestBody DispatchRequest req, Authentication auth) {
        return ResponseEntity.ok(manufacturerService.dispatch(
                req, getBusinessId(auth), getUserId(auth)));
    }
}
