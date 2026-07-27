package com.stockflow.stockflowbackend.auth;

import com.stockflow.stockflowbackend.dto.*;
import com.stockflow.stockflowbackend.email.EmailSenderService;
import com.stockflow.stockflowbackend.email.EmailTemplateUtil;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.geo.CountryCatalog;
import com.stockflow.stockflowbackend.security.JwtUtil;
import com.stockflow.stockflowbackend.subscription.PlanCatalog;
import org.springframework.beans.factory.annotation.Value;
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
    private final EmailSenderService emailSenderService;

    @Value("${frontend.web.base-url}")
    private String frontendWebBaseUrl;

    public AuthService(UserRepository userRepository,
                       BusinessRepository businessRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailSenderService emailSenderService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailSenderService = emailSenderService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getAdminEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        PasswordValidator.validate(req.getAdminPassword());

        Business business = new Business();
        business.setName(req.getBusinessName());
        business.setTierType(req.getTierType());
        business.setSubscriptionPlan(req.getSubscriptionPlan());
        business.setSubscriptionStatus("TRIAL");
        business.setTrialStartedAt(LocalDateTime.now());
        business.setCountry(CountryCatalog.isSupported(req.getCountry())
                ? req.getCountry() : CountryCatalog.DEFAULT_COUNTRY);
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

        String welcomeHtml = EmailTemplateUtil.wrap(
                "Welcome, " + savedAdmin.getName() + " 👋",
                savedBusiness.getName() + " is now on StockFlow Pro",
                EmailTemplateUtil.paragraph("Your 14-day free trial is active, no card required. "
                        + "Log in any time with <strong>" + savedAdmin.getEmail() + "</strong> to start managing "
                        + "your inventory, sales, and credit accounts.")
                        + EmailTemplateUtil.smallNote("Didn't create this account? You can safely ignore this email."));
        emailSenderService.sendAsync(savedAdmin.getEmail(), "Welcome to StockFlow Pro", welcomeHtml);

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
        response.setCountry(savedBusiness.getCountry());

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

        String inviteHtml = EmailTemplateUtil.wrap(
                "You're invited 🎉",
                inviter.getName() + " added you to " + business.getName(),
                EmailTemplateUtil.paragraph("You've been added as a <strong>" + role + "</strong> on "
                        + business.getName() + "'s StockFlow Pro account. Use these details to log in:")
                        + EmailTemplateUtil.credentialBox("Login email", email, "Temporary password", temporaryPassword)
                        + EmailTemplateUtil.smallNote("You'll be asked to set your own password the first time you log in."));
        emailSenderService.sendAsync(email, "You've been added to " + business.getName() + " on StockFlow Pro", inviteHtml);

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
        response.setCountry(CountryCatalog.isSupported(business.getCountry())
                ? business.getCountry() : CountryCatalog.DEFAULT_COUNTRY);

        if (Boolean.TRUE.equals(user.getIsSubAccount()) && user.getParentUserId() != null) {
            userRepository.findById(user.getParentUserId())
                    .ifPresent(admin -> response.setAdminEmail(admin.getEmail()));
        }

        return response;
    }

    @Transactional
    public Map<String, Object> updateProfileName(Long userId, String name) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Name cannot be empty");
        }
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(name.trim());
        userRepository.save(user);
        return Map.of("name", user.getName());
    }

    @Transactional
    public Map<String, Object> updateCountry(Long businessId, String country) {
        if (!CountryCatalog.isSupported(country)) {
            throw new RuntimeException("Unsupported country");
        }
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));
        business.setCountry(country);
        businessRepository.save(business);
        return Map.of("country", business.getCountry());
    }

    @Transactional
    public Map<String, Object> changeEmail(Long userId, ChangeEmailRequest req) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getCurrentPassword() == null
                || !passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        if (req.getNewEmail() == null || req.getNewEmail().isBlank()) {
            throw new RuntimeException("New email cannot be empty");
        }
        String newEmail = req.getNewEmail().trim().toLowerCase();
        if (!newEmail.equals(user.getEmail().toLowerCase())
                && userRepository.findByEmail(newEmail).isPresent()) {
            throw new RuntimeException("That email is already in use");
        }

        String oldEmail = user.getEmail();
        user.setEmail(newEmail);
        userRepository.save(user);

        Business business = user.getBusiness();
        String effectiveRole = Boolean.TRUE.equals(user.getIsSubAccount())
                ? "SUB_ACCOUNT" : user.getRole();
        String newToken = jwtUtil.generateToken(newEmail, business.getId(), user.getId(), effectiveRole);

        String html = EmailTemplateUtil.wrap(
                "Email address changed",
                "A security update on your account",
                EmailTemplateUtil.paragraph("The email on your StockFlow Pro account was changed from <strong>"
                        + oldEmail + "</strong> to <strong>" + newEmail + "</strong>.")
                        + EmailTemplateUtil.smallNote("If you didn't make this change, contact support immediately."));
        emailSenderService.sendAsync(oldEmail, "Your StockFlow Pro account email was changed", html);
        emailSenderService.sendAsync(newEmail, "Your StockFlow Pro account email was changed", html);

        return Map.of("email", newEmail, "token", newToken);
    }

    @Transactional
    public Map<String, Object> changePassword(Long userId, ChangePasswordRequest req) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getCurrentPassword() == null
                || !passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        PasswordValidator.validate(req.getNewPassword());

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        String html = EmailTemplateUtil.wrap(
                "Password changed",
                "A security update on your account",
                EmailTemplateUtil.paragraph("The password on your StockFlow Pro account was just changed.")
                        + EmailTemplateUtil.smallNote("If you didn't make this change, contact support immediately."));
        emailSenderService.sendAsync(user.getEmail(), "Your StockFlow Pro password was changed", html);

        return Map.of("success", true);
    }

    @Transactional
    public Map<String, Object> forgotPassword(ForgotPasswordRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new RuntimeException("Email cannot be empty");
        }

        Optional<AppUser> userOpt = userRepository.findByEmail(req.getEmail().trim().toLowerCase());
        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            String token = UUID.randomUUID().toString();
            user.setResetToken(token);
            user.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(30));
            userRepository.save(user);

            String resetLink = frontendWebBaseUrl + "/reset-password?token=" + token;
            String html = EmailTemplateUtil.wrap(
                    "Reset your password",
                    "This link expires in 30 minutes",
                    EmailTemplateUtil.paragraph("We received a request to reset the password for your StockFlow Pro account.")
                            + EmailTemplateUtil.button(resetLink, "Reset Password")
                            + EmailTemplateUtil.smallNote("If you didn't request this, you can safely ignore this email — your password won't change."));
            emailSenderService.sendAsync(user.getEmail(), "Reset your StockFlow Pro password", html);
        }

        // Always return the same response, whether or not the email exists,
        // so this endpoint can't be used to find out which emails are registered.
        return Map.of("success", true, "message", "If that email exists, a reset link has been sent.");
    }

    @Transactional
    public Map<String, Object> resetPassword(ResetPasswordRequest req) {
        if (req.getToken() == null || req.getToken().isBlank()) {
            throw new RuntimeException("Reset token is required");
        }
        PasswordValidator.validate(req.getNewPassword());

        AppUser user = userRepository.findByResetToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link"));

        if (user.getResetTokenExpiresAt() == null
                || user.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid or expired reset link");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);

        String html = EmailTemplateUtil.wrap(
                "Password reset",
                "A security update on your account",
                EmailTemplateUtil.paragraph("Your StockFlow Pro password was just reset.")
                        + EmailTemplateUtil.smallNote("If you didn't make this change, contact support immediately."));
        emailSenderService.sendAsync(user.getEmail(), "Your StockFlow Pro password was reset", html);

        return Map.of("success", true);
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