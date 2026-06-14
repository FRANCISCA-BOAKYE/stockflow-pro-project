package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class DashboardResponse {

    // Common fields for all tiers
    private String businessName;
    private String tierType;
    private String subscriptionStatus;

    // Retailer fields
    private Integer totalProducts;
    private Integer lowStockCount;
    private BigDecimal todaySalesUsd;
    private Integer totalTransactionsToday;
    private BigDecimal totalCreditOwed;
    private Integer overdueAccountsCount;

    // Wholesaler fields
    private Integer totalWarehouseProducts;
    private Integer lowStockWarehouseCount;
    private BigDecimal totalCreditOwedToManufacturers;
    private BigDecimal totalCreditOwedByRetailers;

    // Manufacturer fields
    private Integer totalMaterials;
    private Integer lowStockMaterialsCount;
    private Integer totalFinishedGoods;
    private BigDecimal totalCreditOwedByWholesalers;

    public DashboardResponse(String businessName,
                             String tierType,
                             String subscriptionStatus) {
        this.businessName = businessName;
        this.tierType = tierType;
        this.subscriptionStatus = subscriptionStatus;
    }
}