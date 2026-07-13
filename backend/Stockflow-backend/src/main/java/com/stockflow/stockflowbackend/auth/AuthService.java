package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.security.JwtUtil;
import com.stockflow.stockflowbackend.subscription.PlanCatalog;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private static final String PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getAdminEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Business business = new Business();
        business.setName(req.getBusinessName());
        business.setTierType(req.getTierType());
        business.setSubscriptionPlan(req.getSubscriptionPlan());
        business.setSubscriptionStatus("TRIAL");
        business.setTrialStartedAt(LocalDateTime.now());
        Business savedBusiness = businessRepository.save(business);

        AppUser admin = new AppUser();
        admin.setBusiness(savedBusiness);
        admin.setName(req.getAdminName());
        admin.setEmail(req.getAdminEmail());
        admin.setPasswordHash(passwordEncoder.encode(req.getAdminPassword()));
        admin.setRole("COMPANY_ADMIN");
        admin.setIsSubAccount(false);
        AppUser savedAdmin = userRepository.save(admin);

        String token = jwtUtil.generateToken(
                savedAdmin.getEmail(), savedBusiness.getId(), savedAdmin.getId(), "COMPANY_ADMIN");

        RegisterResponse response = new RegisterResponse();
        response.setToken(token);
        response.setName(savedAdmin.getName());
        response.setEmail(savedAdmin.getEmail());
        response.setRole("COMPANY_ADMIN");
        response.setBusinessId(savedBusiness.getId());
        response.setBusinessName(savedBusiness.getName());
        response.setTierType(req.getTierType());
        response.setSubscriptionStatus("TRIAL");
        response.setSubscriptionPlan(req.getSubscriptionPlan());
        response.setSubAccounts(new ArrayList<>());

        return response;
    }

    @Transactional
    public Map<String, Object> inviteSubAccount(
            String email, String role, Long businessId, String inviterEmail) {

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        List<AppUser> existing = userRepository
                .findByBusiness_IdAndIsSubAccountTrue(businessId);
        int maxAccounts = PlanCatalog.maxSubAccounts(
                business.getTierType(), business.getSubscriptionPlan());
        if (existing.size() >= maxAccounts - 1) {
            throw new RuntimeException("Sub-account limit reached for your plan");
        }

        AppUser inviter = userRepository.findByEmail(inviterEmail)
                .orElseThrow(() -> new RuntimeException("Inviting user not found"));

        String temporaryPassword = generateTemporaryPassword();

        AppUser subUser = new AppUser();
        subUser.setBusiness(business);
        subUser.setName(role);
        subUser.setEmail(email);
        subUser.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        subUser.setRole("SUB_ACCOUNT");
        subUser.setIsSubAccount(true);
        subUser.setParentUserId(inviter.getId());
        subUser.setSubAccountRole(role);
        subUser.setMustChangePassword(true);
        userRepository.save(subUser);

        return Map.of(
                "success", true,
                "email", email,
                "role", role,
                "temporaryPassword", temporaryPassword
        );
    }

    private String generateTemporaryPassword() {
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) {
            sb.append(PASSWORD_CHARS.charAt(RANDOM.nextInt(PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    @Transactional
    public LoginResponse login(LoginRequest req) {
        AppUser user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        Business business = user.getBusiness();
        String effectiveRole = Boolean.TRUE.equals(user.getIsSubAccount())
                ? "SUB_ACCOUNT" : user.getRole();

        String token = jwtUtil.generateToken(
                user.getEmail(), business.getId(), user.getId(), effectiveRole);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(effectiveRole);
        response.setBusinessId(business.getId());
        response.setBusinessName(business.getName());
        response.setTierType(business.getTierType());
        response.setSubscriptionStatus(business.getSubscriptionStatus());
        response.setSubscriptionPlan(business.getSubscriptionPlan());
        response.setIsSubAccount(Boolean.TRUE.equals(user.getIsSubAccount()));
        response.setSubAccountRole(user.getSubAccountRole());
        response.setTrialStartedAt(business.getTrialStartedAt());

        if (Boolean.TRUE.equals(user.getIsSubAccount()) && user.getParentUserId() != null) {
            userRepository.findById(user.getParentUserId())
                    .ifPresent(admin -> response.setAdminEmail(admin.getEmail()));
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<SubAccountResponse> getSubAccounts(Long businessId) {
        List<AppUser> subUsers = userRepository
                .findByBusiness_IdAndIsSubAccountTrue(businessId);
        List<SubAccountResponse> result = new ArrayList<>();
        for (AppUser u : subUsers) {
            SubAccountResponse r = new SubAccountResponse();
            r.setRole(u.getSubAccountRole());
            r.setEmail(u.getEmail());
            r.setTemporaryPassword(null);
            r.setIsActive(u.getIsActive());
            result.add(r);
        }
        return result;
    }
}