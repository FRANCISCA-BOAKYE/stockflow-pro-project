package com.stockflow.stockflowbackend.retailer;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.Category;
import com.stockflow.stockflowbackend.model.RetailTransaction;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/retailer")
public class RetailerController {

    private final RetailerService retailerService;

    public RetailerController(RetailerService retailerService) {
        this.retailerService = retailerService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    private Long getUserId(Authentication authentication) {
        return (Long) authentication.getCredentials();
    }

    @GetMapping("/products")
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.getProducts(
                getBusinessId(authentication),
                search, categoryId, page, size));
    }

    @PostMapping("/products")
    public ResponseEntity<ProductResponse> addProduct(
            @RequestBody AddProductRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.addProduct(
                request, getBusinessId(authentication)));
    }

    @GetMapping("/products/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStock(
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.getLowStockProducts(
                getBusinessId(authentication)));
    }

    @PostMapping("/stock-in")
    public ResponseEntity<RetailTransaction> stockIn(
            @RequestBody StockInRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.stockIn(
                request, getBusinessId(authentication), getUserId(authentication)));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories(
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.getCategories(
                getBusinessId(authentication)));
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> addCategory(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.addCategory(
                body.get("name"), getBusinessId(authentication)));
    }

    @PutMapping("/products/{id}/image")
    public ResponseEntity<ProductResponse> updateProductImage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.updateProductImage(
                getBusinessId(authentication), id, body.get("imageBase64")));
    }

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponse>> getCustomers(
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.getCustomers(
                getBusinessId(authentication)));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<List<CustomerPurchaseResponse>> getCustomerHistory(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(retailerService.getCustomerHistory(
                getBusinessId(authentication), id));
    }
}