package com.stockflow.stockflowbackend.wholesaler;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.Receipt;
import com.stockflow.stockflowbackend.model.WholesaleSale;
import com.stockflow.stockflowbackend.model.WarehouseProduct;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/wholesaler")
public class WholesalerController {

    private final WholesalerService wholesalerService;

    public WholesalerController(WholesalerService wholesalerService) {
        this.wholesalerService = wholesalerService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping("/products")
    public ResponseEntity<WarehouseProduct> addProduct(
            @RequestBody AddWarehouseProductRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(wholesalerService.addProduct(
                request, getBusinessId(authentication)));
    }

    @GetMapping("/stock")
    public ResponseEntity<List<WarehouseStockResponse>> getStock(
            Authentication authentication) {
        return ResponseEntity.ok(wholesalerService.getStock(
                getBusinessId(authentication)));
    }

    @PostMapping("/receive")
    public ResponseEntity<Receipt> receive(
            @RequestBody ReceiveStockRequest request,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        return ResponseEntity.ok(wholesalerService.receiveFromManufacturer(
                request, businessId, businessId));
    }

    @PostMapping("/sell")
    public ResponseEntity<WholesaleSale> sell(
            @RequestBody WholesaleSaleRequest request,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        return ResponseEntity.ok(wholesalerService.sellToRetailer(
                request, businessId, businessId));
    }
}