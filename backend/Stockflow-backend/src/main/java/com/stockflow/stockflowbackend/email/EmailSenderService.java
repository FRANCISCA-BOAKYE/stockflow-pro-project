package com.stockflow.stockflowbackend.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Thin wrapper around the nodemailer relay already deployed on frontend-web
 * (POST /api/send-email), so backend services don't each need a mail
 * dependency. Best-effort: never throws, never blocks the caller.
 */
@Service
public class EmailSenderService {

    private static final Logger log = LoggerFactory.getLogger(EmailSenderService.class);

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${frontend.web.base-url}")
    private String frontendWebBaseUrl;

    public void sendAsync(String to, String subject, String html) {
        try {
            String body = "{"
                    + "\"to\":\"" + jsonEscape(to) + "\","
                    + "\"subject\":\"" + jsonEscape(subject) + "\","
                    + "\"html\":\"" + jsonEscape(html) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(frontendWebBaseUrl + "/api/send-email"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .exceptionally(e -> {
                        log.warn("Failed to send email to {}: {}", to, e.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Failed to build/send email to {}: {}", to, e.getMessage());
        }
    }

    private String jsonEscape(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
