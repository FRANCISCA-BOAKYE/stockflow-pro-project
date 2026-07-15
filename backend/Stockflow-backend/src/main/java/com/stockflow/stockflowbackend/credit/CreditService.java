package com.stockflow.stockflowbackend.credit;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.CreditRecord;
import com.stockflow.stockflowbackend.notification.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditService {

    private final CreditRepository creditRepository;
    private final BusinessRepository businessRepository;
    private final NotificationService notificationService;

    public CreditService(CreditRepository creditRepository,
                         BusinessRepository businessRepository,
                         NotificationService notificationService) {
        this.creditRepository = creditRepository;
        this.businessRepository = businessRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public CreditRecord createCreditRecord(CreateCreditRequest request, Long callerBusinessId) {
        CreditRecord record = new CreditRecord();

        Business creditor = businessRepository.findById(request.getCreditorBusinessId())
                .orElseThrow(() -> new RuntimeException("Creditor business not found"));
        Business debtor = businessRepository.findById(request.getDebtorBusinessId())
                .orElseThrow(() -> new RuntimeException("Debtor business not found"));

        if (!callerBusinessId.equals(creditor.getId()) && !callerBusinessId.equals(debtor.getId())) {
            throw new RuntimeException("Unauthorized: this credit record does not belong to your business");
        }

        record.setCreditorBusiness(creditor);
        record.setDebtorBusiness(debtor);
        record.setAmountUsd(request.getAmountUsd());
        record.setDueDate(request.getDueDate());
        record.setStatus("OUTSTANDING");
        record.setHoldPlaced(false);

        return creditRepository.save(record);
    }

    @Transactional
    public CreditRecord recordPayment(CreditPaymentRequest request, Long callerBusinessId) {
        CreditRecord record = creditRepository.findById(request.getCreditRecordId())
                .orElseThrow(() -> new RuntimeException("Credit record not found"));

        if (!callerBusinessId.equals(record.getCreditorBusiness().getId())
                && !callerBusinessId.equals(record.getDebtorBusiness().getId())) {
            throw new RuntimeException("Unauthorized: this credit record does not belong to your business");
        }

        BigDecimal remaining = record.getAmountUsd().subtract(request.getAmountPaid());

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            record.setStatus("SETTLED");
            record.setSettledAt(LocalDateTime.now());
            record.setAmountUsd(BigDecimal.ZERO);
        } else {
            record.setAmountUsd(remaining);
        }

        CreditRecord saved = creditRepository.save(record);

        // Individual (non-business) debtors have no account to notify, so only
        // notify when both sides of this record are real registered businesses.
        if (record.getDebtorBusiness() != null) {
            boolean callerIsCreditor = callerBusinessId.equals(record.getCreditorBusiness().getId());
            Business recipient = callerIsCreditor ? record.getDebtorBusiness() : record.getCreditorBusiness();
            Business actor = callerIsCreditor ? record.getCreditorBusiness() : record.getDebtorBusiness();
            String settledNote = "SETTLED".equals(saved.getStatus()) ? " — fully settled" : "";
            notificationService.notify(recipient, "CREDIT_PAYMENT", "success",
                    "Payment recorded",
                    actor.getName() + " recorded a payment of $" + request.getAmountPaid() + settledNote);
        }

        return saved;
    }

    @Transactional
    public CreditRecord toggleHold(CreditHoldRequest request, Long creditorBusinessId) {
        List<CreditRecord> records = creditRepository
                .findByCreditorBusinessIdAndStatus(creditorBusinessId, "OUTSTANDING");

        CreditRecord targetRecord = records.stream()
                .filter(r -> r.getDebtorBusiness() != null
                        && r.getDebtorBusiness().getId().equals(request.getDebtorBusinessId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No outstanding credit with this business"));

        targetRecord.setHoldPlaced(request.getHoldActive());
        CreditRecord saved = creditRepository.save(targetRecord);

        Business creditor = businessRepository.findById(creditorBusinessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        if (Boolean.TRUE.equals(request.getHoldActive())) {
            notificationService.notify(targetRecord.getDebtorBusiness(), "CREDIT_HOLD", "warning",
                    "Credit hold placed",
                    creditor.getName() + " placed a hold on your account until outstanding credit is paid");
        } else {
            notificationService.notify(targetRecord.getDebtorBusiness(), "CREDIT_HOLD", "success",
                    "Credit hold lifted",
                    creditor.getName() + " lifted the hold on your account");
        }

        return saved;
    }

    @Transactional
    public List<CreditAccountResponse> getCreditAccounts(Long businessId) {
        List<CreditAccountResponse> result = new java.util.ArrayList<>();

        // Money owed TO this business (this business is creditor) — debtor may be a
        // registered business, or an individual walk-in customer with no account.
        List<CreditRecord> owedToMe = creditRepository.findByCreditorBusinessIdFetchDebtor(businessId);
        result.addAll(owedToMe.stream().map(r -> {
            CreditAccountResponse resp = new CreditAccountResponse(
                    r.getId(),
                    r.getDebtorBusiness() != null ? r.getDebtorBusiness().getId() : null,
                    r.getDebtorBusiness() != null ? r.getDebtorBusiness().getName() : r.getDebtorName(),
                    r.getAmountUsd(),
                    r.getDueDate(),
                    r.getStatus(),
                    r.getHoldPlaced(),
                    "OWED_TO_ME"
            );
            resp.setDebtorContact(r.getDebtorContact());
            resp.setDebtorAddress(r.getDebtorAddress());
            return resp;
        }).collect(Collectors.toList()));

        // Money this business OWES (this business is debtor)
        List<CreditRecord> iOwe = creditRepository.findByDebtorBusinessIdFetchCreditor(businessId);
        result.addAll(iOwe.stream().map(r -> new CreditAccountResponse(
                r.getId(),
                r.getCreditorBusiness().getId(),
                r.getCreditorBusiness().getName(),
                r.getAmountUsd(),
                r.getDueDate(),
                r.getStatus(),
                r.getHoldPlaced(),
                "I_OWE"
        )).collect(Collectors.toList()));

        return result;
    }

    @Transactional
    public List<CreditAccountResponse> getOverdueAccounts(Long businessId) {
        LocalDate today = LocalDate.now();
        return getCreditAccounts(businessId).stream()
                .filter(r -> "OUTSTANDING".equals(r.getStatus())
                        && r.getDueDate() != null && r.getDueDate().isBefore(today))
                .collect(Collectors.toList());
    }
}