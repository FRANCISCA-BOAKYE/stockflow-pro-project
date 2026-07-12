package com.stockflow.stockflowbackend.credit;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.CreditRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/credit")
public class CreditController {

    private final CreditService creditService;

    public CreditController(CreditService creditService) {
        this.creditService = creditService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping("/record")
    public ResponseEntity<CreditRecord> createRecord(
            @RequestBody CreateCreditRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                creditService.createCreditRecord(request, getBusinessId(authentication)));
    }

    @PostMapping("/payment")
    public ResponseEntity<CreditRecord> recordPayment(
            @RequestBody CreditPaymentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                creditService.recordPayment(request, getBusinessId(authentication)));
    }

    @PostMapping("/hold")
    public ResponseEntity<CreditRecord> toggleHold(
            @RequestBody CreditHoldRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                creditService.toggleHold(request, getBusinessId(authentication)));
    }

    @GetMapping("/accounts")
    public ResponseEntity<List<CreditAccountResponse>> getAccounts(
            Authentication authentication) {
        return ResponseEntity.ok(
                creditService.getCreditAccounts(getBusinessId(authentication)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<CreditAccountResponse>> getOverdue(
            Authentication authentication) {
        return ResponseEntity.ok(
                creditService.getOverdueAccounts(getBusinessId(authentication)));
    }
}