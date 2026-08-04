package com.stockflow.stockflowbackend.security;

import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.model.AppUser;
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

/**
 * Blocks every authenticated endpoint except /auth/* until a sub-account has
 * replaced their emailed temporary password. Without this, mustChangePassword
 * was purely advisory data the mobile UI happened to respect — anyone calling
 * the API directly (or a web client that doesn't check the flag) could use a
 * temporary password indefinitely.
 */
@Component
public class MustChangePasswordFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;

    public MustChangePasswordFilter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getCredentials() == null) {
            filterChain.doFilter(request, response);
            return;
        }

        Long userId = (Long) auth.getCredentials();
        AppUser user = userRepository.findById(userId).orElse(null);

        if (user != null && Boolean.TRUE.equals(user.getMustChangePassword())) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"error\":\"You must set a new password before continuing.\","
                            + "\"status\":403,\"mustChangePassword\":true}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
