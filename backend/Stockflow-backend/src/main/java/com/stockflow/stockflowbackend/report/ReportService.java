package com.stockflow.stockflowbackend.report;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.DashboardResponse;
import com.stockflow.stockflowbackend.manufacturer.DispatchRepository;
import com.stockflow.stockflowbackend.manufacturer.MaterialRepository;
import com.stockflow.stockflowbackend.manufacturer.ProductionRunRepository;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.CreditRecord;
import com.stockflow.stockflowbackend.model.Dispatch;
import com.stockflow.stockflowbackend.model.ProductionRun;
import com.stockflow.stockflowbackend.model.Receipt;
import com.stockflow.stockflowbackend.model.RetailTransaction;
import com.stockflow.stockflowbackend.model.WholesaleSale;
import com.stockflow.stockflowbackend.retailer.ProductRepository;
import com.stockflow.stockflowbackend.retailer.RetailTransactionRepository;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import com.stockflow.stockflowbackend.tierlink.TierLinkRepository;
import com.stockflow.stockflowbackend.wholesaler.ReceiptRepository;
import com.stockflow.stockflowbackend.wholesaler.WarehouseProductRepository;
import com.stockflow.stockflowbackend.wholesaler.WholesaleSaleRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final BusinessRepository businessRepository;
    private final CreditRepository creditRepository;
    private final ProductRepository productRepository;
    private final RetailTransactionRepository transactionRepository;
    private final MaterialRepository materialRepository;
    private final ProductionRunRepository productionRunRepository;
    private final WarehouseProductRepository warehouseProductRepository;
    private final WholesaleSaleRepository wholesaleSaleRepository;
    private final TierLinkRepository tierLinkRepository;
    private final ReceiptRepository receiptRepository;
    private final DispatchRepository dispatchRepository;
    private final SubscriptionService subscriptionService;

    public ReportService(BusinessRepository businessRepository,
                         CreditRepository creditRepository,
                         ProductRepository productRepository,
                         RetailTransactionRepository transactionRepository,
                         MaterialRepository materialRepository,
                         ProductionRunRepository productionRunRepository,
                         WarehouseProductRepository warehouseProductRepository,
                         WholesaleSaleRepository wholesaleSaleRepository,
                         TierLinkRepository tierLinkRepository,
                         ReceiptRepository receiptRepository,
                         DispatchRepository dispatchRepository,
                         SubscriptionService subscriptionService) {
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.materialRepository = materialRepository;
        this.productionRunRepository = productionRunRepository;
        this.warehouseProductRepository = warehouseProductRepository;
        this.wholesaleSaleRepository = wholesaleSaleRepository;
        this.tierLinkRepository = tierLinkRepository;
        this.receiptRepository = receiptRepository;
        this.dispatchRepository = dispatchRepository;
        this.subscriptionService = subscriptionService;
    }

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        DashboardResponse response = new DashboardResponse(
                business.getName(),
                business.getTierType(),
                business.getSubscriptionStatus()
        );
        response.setTrialStartedAt(business.getTrialStartedAt());

        switch (business.getTierType()) {
            case "RETAILER" -> buildRetailerDashboard(response, businessId);
            case "WHOLESALER" -> buildWholesalerDashboard(response, businessId);
            case "MANUFACTURER" -> buildManufacturerDashboard(response, businessId);
        }

        if (subscriptionService.hasFeature(business, SubscriptionFeature.RECENT_ACTIVITY_FEED)) {
            response.setRecentActivity(buildRecentActivity(business, businessId));
        }

        return response;
    }

    private List<Map<String, Object>> buildRecentActivity(Business business, Long businessId) {
        List<Map.Entry<LocalDateTime, Map<String, Object>>> entries = new ArrayList<>();
        PageRequest top5 = PageRequest.of(0, 5);

        switch (business.getTierType()) {
            case "RETAILER" -> {
                for (RetailTransaction t : transactionRepository
                        .findByBusinessIdOrderByRecordedAtDesc(businessId, top5)) {
                    boolean isSale = "OUT".equals(t.getType());
                    entries.add(Map.entry(t.getRecordedAt(), activityEntry(
                            isSale ? "Sold " + t.getProduct().getName() : "Restocked " + t.getProduct().getName(),
                            t.getRecordedBy().getName(), t.getAmountUsd(), t.getRecordedAt(), isSale)));
                }
            }
            case "WHOLESALER" -> {
                for (WholesaleSale w : wholesaleSaleRepository
                        .findByBusinessIdOrderBySoldAtDesc(businessId, top5)) {
                    entries.add(Map.entry(w.getSoldAt(), activityEntry(
                            "Sold to " + w.getRetailerBusiness().getName(),
                            w.getRecordedBy().getName(), w.getAmountUsd(), w.getSoldAt(), true)));
                }
                for (Receipt r : receiptRepository
                        .findByBusinessIdOrderByReceivedAtDesc(businessId, top5)) {
                    entries.add(Map.entry(r.getReceivedAt(), activityEntry(
                            "Received from " + r.getManufacturerBusiness().getName(),
                            r.getRecordedBy().getName(), r.getAmountUsd(), r.getReceivedAt(), false)));
                }
            }
            case "MANUFACTURER" -> {
                for (Dispatch d : dispatchRepository
                        .findByBusinessIdOrderByDispatchedAtDesc(businessId, top5)) {
                    entries.add(Map.entry(d.getDispatchedAt(), activityEntry(
                            "Dispatched to " + d.getWholesalerBusiness().getName(),
                            d.getRecordedBy().getName(), d.getAmountUsd(), d.getDispatchedAt(), true)));
                }
                for (ProductionRun p : productionRunRepository
                        .findByBusinessIdOrderByConfirmedAtDesc(businessId)
                        .stream().limit(5).toList()) {
                    entries.add(Map.entry(p.getConfirmedAt(), activityEntry(
                            "Produced " + p.getTotalUnits() + " units of " + p.getRecipe().getProductName(),
                            p.getConfirmedBy().getName(), p.getTotalCostUsd(), p.getConfirmedAt(), false)));
                }
            }
        }

        return entries.stream()
                .sorted(Comparator.comparing((Map.Entry<LocalDateTime, Map<String, Object>> e) -> e.getKey()).reversed())
                .limit(5)
                .map(Map.Entry::getValue)
                .toList();
    }

    private Map<String, Object> activityEntry(String name, String by, BigDecimal amount,
                                              LocalDateTime at, boolean positive) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("name", name);
        entry.put("by", by);
        entry.put("time", relativeTime(at));
        String formattedAmount = amount != null ? "$" + amount.toPlainString() : null;
        entry.put("amount", formattedAmount);
        entry.put("detail", formattedAmount);
        entry.put("positive", positive);
        return entry;
    }

    private String relativeTime(LocalDateTime at) {
        if (at == null) return "";
        long minutes = Duration.between(at, LocalDateTime.now()).toMinutes();
        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        return days + "d ago";
    }

    private void buildRetailerDashboard(DashboardResponse response,
                                        Long businessId) {
        // Total active products
        response.setTotalProducts((int) productRepository
                .countByBusinessIdAndIsActiveTrue(businessId));

        // Low stock count
        response.setLowStockCount(
                productRepository.findLowStock(businessId).size());

        // Credit owed (this business is debtor)
        List<CreditRecord> iOwe = creditRepository
                .findByDebtorBusinessIdAndStatus(businessId, "OUTSTANDING");
        BigDecimal totalOwed = iOwe.stream()
                .map(CreditRecord::getAmountUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalCreditOwedByCustomers(totalOwed);

        // Overdue count
        long overdue = iOwe.stream()
                .filter(c -> c.getDueDate().isBefore(LocalDate.now()))
                .count();
        response.setOverdueAccountsCount((int) overdue);

        // Today's sales
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        BigDecimal todaySales = transactionRepository.sumSalesInRange(
                businessId, startOfDay, startOfDay.plusDays(1));
        response.setTodaySalesUsd(todaySales);
    }

    private void buildWholesalerDashboard(DashboardResponse response,
                                          Long businessId) {
        // Credit owed TO manufacturers (this business is debtor)
        List<CreditRecord> owedToManufacturers = creditRepository
                .findByDebtorBusinessIdAndStatus(businessId, "OUTSTANDING");
        BigDecimal totalOwedToManufacturers = owedToManufacturers.stream()
                .map(CreditRecord::getAmountUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalCreditOwedToManufacturers(totalOwedToManufacturers);

        // Credit owed BY retailers (this business is creditor)
        List<CreditRecord> owedByRetailers = creditRepository
                .findByCreditorBusinessIdAndStatus(businessId, "OUTSTANDING");
        BigDecimal totalOwedByRetailers = owedByRetailers.stream()
                .map(CreditRecord::getAmountUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalCreditOwedByRetailers(totalOwedByRetailers);

        // Overdue count
        long overdue = owedToManufacturers.stream()
                .filter(c -> c.getDueDate().isBefore(LocalDate.now()))
                .count();
        response.setOverdueAccountsCount((int) overdue);

        // Warehouse stock item count
        response.setTotalStockItems(
                (int) warehouseProductRepository.countByBusinessId(businessId));

        // Today's sales
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        response.setTodaySalesUsd(wholesaleSaleRepository
                .sumSalesInRange(businessId, startOfDay, startOfDay.plusDays(1)));

        // Active linked retailers
        response.setActiveRetailers(
                (int) tierLinkRepository.countActiveRetailerPartners(businessId));
    }

    private void buildManufacturerDashboard(DashboardResponse response,
                                            Long businessId) {
        // Credit owed BY wholesalers (this business is creditor)
        List<CreditRecord> owedByWholesalers = creditRepository
                .findByCreditorBusinessIdAndStatus(businessId, "OUTSTANDING");
        BigDecimal totalOwed = owedByWholesalers.stream()
                .map(CreditRecord::getAmountUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalCreditOwedByWholesalers(totalOwed);

        // Overdue count
        long overdue = owedByWholesalers.stream()
                .filter(c -> c.getDueDate().isBefore(LocalDate.now()))
                .count();
        response.setOverdueAccountsCount((int) overdue);

        // Raw materials + low stock
        response.setTotalMaterials(
                (int) materialRepository.countByBusinessId(businessId));
        response.setLowStockCount(materialRepository.findLowStock(businessId).size());

        // Production runs this month
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        response.setProductionRunsThisMonth(
                (int) productionRunRepository.countSince(businessId, startOfMonth));
    }
}