package com.stockflow.stockflowbackend.report;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.credit.CreditRepository;
import com.stockflow.stockflowbackend.dto.DashboardResponse;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.CreditRecord;
import com.stockflow.stockflowbackend.retailer.ProductRepository;
import com.stockflow.stockflowbackend.retailer.RetailTransactionRepository;
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

    public ReportService(BusinessRepository businessRepository,
                         CreditRepository creditRepository,
                         ProductRepository productRepository,
                         RetailTransactionRepository transactionRepository) {
        this.businessRepository = businessRepository;
        this.creditRepository = creditRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
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
        long totalProducts = productRepository
                .findByBusinessIdAndIsActiveTrue(businessId,
                        org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();
        response.setTotalProducts((int) totalProducts);

        // Low stock count
        List<?> lowStock = productRepository
                .findByBusinessIdAndIsActiveTrueAndQuantityLessThanEqual(
                        businessId, new BigDecimal("999999"))
                .stream()
                .filter(p -> {
                    com.stockflow.stockflowbackend.model.Product product =
                            (com.stockflow.stockflowbackend.model.Product) p;
                    return product.getQuantity()
                            .compareTo(product.getMinThreshold()) <= 0;
                }).toList();
        response.setLowStockCount(lowStock.size());

        // Credit owed (this business is debtor)
        List<CreditRecord> iOwe = creditRepository
                .findByDebtorBusinessIdAndStatus(businessId, "OUTSTANDING");
        BigDecimal totalOwed = iOwe.stream()
                .map(CreditRecord::getAmountUsd)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotalCreditOwed(totalOwed);

        // Overdue count
        long overdue = iOwe.stream()
                .filter(c -> c.getDueDate().isBefore(LocalDate.now()))
                .count();
        response.setOverdueAccountsCount((int) overdue);

        // Today's sales
        BigDecimal todaySales = transactionRepository
                .findByBusinessIdOrderByRecordedAtDesc(businessId,
                        org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE))
                .getContent()
                .stream()
                .filter(t -> t.getType().equals("OUT")
                        && t.getRecordedAt().toLocalDate()
                        .equals(LocalDate.now()))
                .map(t -> t.getAmountUsd())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
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
    }
}