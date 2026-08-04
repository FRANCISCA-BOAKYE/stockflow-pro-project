package com.stockflow.stockflowbackend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("https://stockflowpro-web.netlify.app");
        config.addAllowedOriginPattern("https://phenomenal-blini-7b80dd.netlify.app");
        config.addAllowedOriginPattern("http://localhost:*");
        // Local network + tunnel origins, so the site can be previewed on a phone
        // during development (e.g. `npm run dev` LAN URL, or an ngrok tunnel).
        config.addAllowedOriginPattern("http://192.168.*:*");
        config.addAllowedOriginPattern("http://10.*:*");
        config.addAllowedOriginPattern("https://*.ngrok-free.app");
        config.addAllowedOriginPattern("https://*.ngrok.app");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}