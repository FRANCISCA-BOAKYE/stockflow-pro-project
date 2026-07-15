package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
public class DashboardResponse {

    // Common fields for all tiers
    private String businessName;
    private String tierType;
    private String subscriptionStatus;
    private LocalDateTime trialStartedAt;

    // Retailer fields
    private Integer totalProducts;
    private Integer lowStockCount;
    private BigDecimal todaySalesUsd;
    private Integer totalTransactionsToday;
    private BigDecimal totalCreditOwedByCustomers;
    private Integer overdueAccountsCount;

    // Wholesaler fields
    private Integer totalStockItems;
    private Integer activeRetailers;
    private BigDecimal totalCreditOwedToManufacturers;
    private BigDecimal totalCreditOwedByRetailers;

    // Manufacturer fields
    private Integer totalMaterials;
    private Integer totalFinishedGoods;
    private Integer productionRunsThisMonth;
    private BigDecimal totalCreditOwedByWholesalers;

    // Premium: recent activity feed (null when not entitled)
    private List<Map<String, Object>> recentActivity;

    public DashboardResponse(String businessName,
                             String tierType,
                             String subscriptionStatus) {
        this.businessName = businessName;
        this.tierType = tierType;
        this.subscriptionStatus = subscriptionStatus;
    }
}