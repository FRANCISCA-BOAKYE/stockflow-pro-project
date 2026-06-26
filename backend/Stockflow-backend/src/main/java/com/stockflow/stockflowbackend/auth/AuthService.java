package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.LoginRequest;
import com.stockflow.stockflowbackend.dto.LoginResponse;
import com.stockflow.stockflowbackend.dto.RegisterRequest;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthService {

    private final AuthRepository authRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AuthRepository authRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.authRepository = authRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        if (authRepository.existsByEmail(request.getAdminEmail())) {
            throw new RuntimeException("Email already in use");
        }

        Business business = new Business();
        business.setName(request.getBusinessName());
        business.setTierType(request.getTierType());
        business.setSubscriptionPlan(request.getSubscriptionPlan());
        business.setSubscriptionStatus("TRIAL");
        Business savedBusiness = businessRepository.save(business);

        AppUser admin = new AppUser();
        admin.setBusiness(savedBusiness);
        admin.setName(request.getAdminName());
        admin.setEmail(request.getAdminEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getAdminPassword()));
        admin.setRole("COMPANY_ADMIN");
        admin.setIsActive(true);
        admin.setMustChangePassword(false);
        authRepository.save(admin);

        return Map.of(
                "message", "Account created successfully",
                "businessId", savedBusiness.getId().toString(),
                "email", admin.getEmail()
        );
    }
     @Transactional
    public LoginResponse login(LoginRequest request) {
        AppUser user = authRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new RuntimeException("Account is disabled");
        }

        Business business = user.getBusiness();

        if (business.getSubscriptionStatus().equals("TRIAL")
                && business.getTrialStartedAt() == null) {
            business.setTrialStartedAt(LocalDateTime.now());
            businessRepository.save(business);
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                business.getId(),
                user.getRole()
        );

        return new LoginResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole(),
                business.getId(),
                business.getName(),
                business.getTierType(),
                business.getSubscriptionStatus()
        );
    }
}