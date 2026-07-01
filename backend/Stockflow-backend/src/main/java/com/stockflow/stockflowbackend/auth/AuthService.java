package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class AuthService {

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
        Business savedBusiness = businessRepository.save(business);

        AppUser admin = new AppUser();
        admin.setBusiness(savedBusiness);
        admin.setName(req.getAdminName());
        admin.setEmail(req.getAdminEmail());
        admin.setPasswordHash(passwordEncoder.encode(req.getAdminPassword()));
        admin.setRole("COMPANY_ADMIN");
        admin.setIsSubAccount(false);
        AppUser savedAdmin = userRepository.save(admin);

        List<SubAccountResponse> subAccounts = generateSubAccounts(
                savedBusiness, savedAdmin.getId(), req.getTierType(), req.getSubscriptionPlan());

      String token = jwtUtil.generateToken(
        savedAdmin.getEmail(), savedBusiness.getId(), "COMPANY_ADMIN");

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
        response.setSubAccounts(subAccounts);

        return response;
    }

    private List<SubAccountResponse> generateSubAccounts(
            Business business, Long parentUserId, String tierType, String plan) {

        List<String> roles = getSubAccountRoles(tierType);
        int maxAccounts = getMaxAccounts(tierType, plan);
        int subAccountCount = Math.min(roles.size(), maxAccounts - 1);

        List<SubAccountResponse> result = new ArrayList<>();
        String tempPassword = "TempPass123!";
        String domain = business.getName()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "") + ".com";

        for (int i = 0; i < subAccountCount; i++) {
            String role = roles.get(i);
            String emailPrefix = role.toLowerCase()
                    .replaceAll("[^a-z0-9]", ".")
                    .replaceAll("\\.+", ".");
            String email = emailPrefix + "@" + domain;

            if (userRepository.findByEmail(email).isPresent()) {
                email = emailPrefix + (i + 2) + "@" + domain;
            }

            AppUser subUser = new AppUser();
            subUser.setBusiness(business);
            subUser.setName(role);
            subUser.setEmail(email);
            subUser.setPasswordHash(passwordEncoder.encode(tempPassword));
            subUser.setRole("SUB_ACCOUNT");
            subUser.setIsSubAccount(true);
            subUser.setParentUserId(parentUserId);
            subUser.setSubAccountRole(role);
            subUser.setMustChangePassword(true);
            userRepository.save(subUser);

            SubAccountResponse subResp = new SubAccountResponse();
            subResp.setRole(role);
            subResp.setEmail(email);
            subResp.setTemporaryPassword(tempPassword);
            subResp.setIsActive(true);
            result.add(subResp);
        }

        return result;
    }

    private List<String> getSubAccountRoles(String tierType) {
        return switch (tierType) {
            case "MANUFACTURER" -> List.of(
                    "Production Supervisor", "Store Keeper", "POS Operator", "Store Keeper 2");
            case "WHOLESALER" -> List.of(
                    "Warehouse Admin", "Receiving Staff", "Sales Staff");
            case "RETAILER" -> List.of("Shop Staff");
            default -> List.of();
        };
    }

    private int getMaxAccounts(String tierType, String plan) {
        return switch (tierType + "_" + plan) {
            case "MANUFACTURER_STANDARD" -> 5;
            case "MANUFACTURER_PREMIUM" -> 10;
            case "WHOLESALER_STANDARD" -> 6;
            case "WHOLESALER_PREMIUM" -> 8;
            case "RETAILER_STANDARD" -> 2;
            case "RETAILER_PREMIUM" -> 5;
            default -> 2;
        };
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
        user.getEmail(), business.getId(), effectiveRole);
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