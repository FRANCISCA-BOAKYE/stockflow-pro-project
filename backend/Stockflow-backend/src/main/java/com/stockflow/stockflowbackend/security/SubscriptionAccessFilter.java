package com.stockflow.stockflowbackend.security;

import com.stockflow.stockflowbackend.auth.BusinessRepository;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class SubscriptionAccessFilter extends OncePerRequestFilter {

    private static final Set<String> EXEMPT_PREFIXES = Set.of(
            "/auth/",
            "/payments/",
            "/subscription/plans",
            "/marketplace/listings"
    );

    private final BusinessRepository businessRepository;
    private final SubscriptionService subscriptionService;

    public SubscriptionAccessFilter(BusinessRepository businessRepository,
                                    SubscriptionService subscriptionService) {
        this.businessRepository = businessRepository;
        this.subscriptionService = subscriptionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (isExempt(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Long businessId = (Long) auth.getDetails();
        Business business = businessRepository.findById(businessId).orElse(null);
        if (business == null) {
            filterChain.doFilter(request, response);
            return;
        }

        subscriptionService.refreshSubscription(business);

        if ("EXPIRED".equals(business.getSubscriptionStatus())) {
            response.setStatus(HttpServletResponse.SC_PAYMENT_REQUIRED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"error\":\"Subscription expired. Please subscribe to continue.\","
                            + "\"status\":402,\"subscriptionStatus\":\"EXPIRED\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean isExempt(String path) {
        for (String prefix : EXEMPT_PREFIXES) {
            if (path.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }
}
