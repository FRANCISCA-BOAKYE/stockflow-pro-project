package com.stockflow.stockflowbackend.report;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.DashboardResponse;
import com.stockflow.stockflowbackend.manufacturer.MaterialRepository;
import com.stockflow.stockflowbackend.manufacturer.ProductionRunRepository;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.CreditRecord;
import com.stockflow.stockflowbackend.retailer.ProductRepository;
import com.stockflow.stockflowbackend.retailer.RetailTransactionRepository;
import com.stockflow.stockflowbackend.tierlink.TierLinkRepository;
import com.stockflow.stockflowbackend.wholesaler.WarehouseProductRepository;
import com.stockflow.stockflowbackend.wholesaler.WholesaleSaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

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

    public ReportService(BusinessRepository businessRepository,
                         CreditRepository creditRepository,
                         ProductRepository productRepository,
                         RetailTransactionRepository transactionRepository,
                         MaterialRepository materialRepository,
                         ProductionRunRepository productionRunRepository,
                         WarehouseProductRepository warehouseProductRepository,
                         WholesaleSaleRepository wholesaleSaleRepository,
                         TierLinkRepository tierLinkRepository) {
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.materialRepository = materialRepository;
        this.productionRunRepository = productionRunRepository;
        this.warehouseProductRepository = warehouseProductRepository;
        this.wholesaleSaleRepository = wholesaleSaleRepository;
        this.tierLinkRepository = tierLinkRepository;
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

        return response;
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