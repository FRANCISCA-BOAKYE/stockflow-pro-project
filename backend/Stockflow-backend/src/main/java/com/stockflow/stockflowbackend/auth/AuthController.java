package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.geo.Country;
import com.stockflow.stockflowbackend.geo.CurrencyRateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final CurrencyRateService currencyRateService;

    public AuthController(AuthService authService, CurrencyRateService currencyRateService) {
        this.authService = authService;
        this.currencyRateService = currencyRateService;
    }

    @GetMapping("/countries")
    public ResponseEntity<Collection<Country>> getCountries() {
        return ResponseEntity.ok(currencyRateService.effectiveCatalog().values());
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/sub-accounts")
    public ResponseEntity<List<SubAccountResponse>> getSubAccounts(Authentication auth) {
        Long businessId = (Long) auth.getDetails();
        return ResponseEntity.ok(authService.getSubAccounts(businessId));
    }

    @PostMapping("/invite-subaccount")
    public ResponseEntity<Map<String, Object>> inviteSubAccount(
            @RequestBody Map<String, String> req,
            Authentication auth) {
        Long businessId = (Long) auth.getDetails();
        return ResponseEntity.ok(authService.inviteSubAccount(
                req.get("email"),
                req.get("role"),
                businessId,
                auth.getName()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> req,
            Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(authService.updateProfileName(userId, req.get("name")));
    }

    @PutMapping("/country")
    public ResponseEntity<Map<String, Object>> updateCountry(
            @RequestBody Map<String, String> req,
            Authentication auth) {
        Long businessId = (Long) auth.getDetails();
        return ResponseEntity.ok(authService.updateCountry(businessId, req.get("country")));
    }

    @PostMapping("/change-email")
    public ResponseEntity<Map<String, Object>> changeEmail(
            @RequestBody ChangeEmailRequest req,
            Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(authService.changeEmail(userId, req));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(
            @RequestBody ChangePasswordRequest req,
            Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(authService.changePassword(userId, req));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(authService.forgotPassword(req));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(authService.resetPassword(req));
    }
}