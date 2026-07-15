package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}