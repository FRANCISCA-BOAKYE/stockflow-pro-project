package com.stockflow.stockflowbackend.credit;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.CreditRecord;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditService {

    private final CreditRepository creditRepository;
    private final BusinessRepository businessRepository;

    public CreditService(CreditRepository creditRepository,
                         BusinessRepository businessRepository) {
        this.creditRepository = creditRepository;
        this.businessRepository = businessRepository;
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

        return creditRepository.save(record);
    }

    @Transactional
    public CreditRecord toggleHold(CreditHoldRequest request, Long creditorBusinessId) {
        List<CreditRecord> records = creditRepository
                .findByCreditorBusinessIdAndStatus(creditorBusinessId, "OUTSTANDING");

        CreditRecord targetRecord = records.stream()
                .filter(r -> r.getDebtorBusiness().getId().equals(request.getDebtorBusinessId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No outstanding credit with this business"));

        targetRecord.setHoldPlaced(request.getHoldActive());
        return creditRepository.save(targetRecord);
    }

    @Transactional
    public List<CreditAccountResponse> getCreditAccounts(Long businessId) {
        List<CreditAccountResponse> result = new java.util.ArrayList<>();

        // Money owed TO this business (this business is creditor)
        List<CreditRecord> owedToMe = creditRepository.findByCreditorBusinessIdFetchDebtor(businessId);
        result.addAll(owedToMe.stream().map(r -> new CreditAccountResponse(
                r.getId(),
                r.getDebtorBusiness().getId(),
                r.getDebtorBusiness().getName(),
                r.getAmountUsd(),
                r.getDueDate(),
                r.getStatus(),
                r.getHoldPlaced(),
                "OWED_TO_ME"
        )).collect(Collectors.toList()));

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
        return getCreditAccounts(businessId).stream()
                .filter(r -> r.getStatus().equals("OVERDUE"))
                .collect(Collectors.toList());
    }
}