package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
}