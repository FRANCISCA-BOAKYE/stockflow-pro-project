package com.stockflow.stockflowbackend.email;

import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Invoice;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Optional;

/**
 * Emails a copy of an invoice to the buyer business, gated behind the
 * INVOICE_DELIVERY premium feature. Reuses the existing nodemailer relay
 * already deployed on frontend-web rather than adding a mail dependency here.
 * Best-effort: never throws, never blocks the sale it's attached to.
 */
@Service
public class InvoiceEmailService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceEmailService.class);

    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${frontend.web.base-url}")
    private String frontendWebBaseUrl;

    public InvoiceEmailService(UserRepository userRepository,
                               SubscriptionService subscriptionService) {
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
    }

    public void sendIfEligible(Invoice invoice, Business seller) {
        try {
            if (invoice.getBuyerBusiness() == null) {
                return;
            }
            if (!subscriptionService.hasFeature(seller, SubscriptionFeature.INVOICE_DELIVERY)) {
                return;
            }

            Optional<AppUser> recipient = userRepository
                    .findFirstByBusiness_IdAndIsSubAccountFalse(invoice.getBuyerBusiness().getId());
            if (recipient.isEmpty()) {
                return;
            }

            String body = "{"
                    + "\"to\":\"" + jsonEscape(recipient.get().getEmail()) + "\","
                    + "\"subject\":\"" + jsonEscape("Invoice " + invoice.getInvoiceNumber() + " from " + seller.getName()) + "\","
                    + "\"html\":\"" + jsonEscape(buildInvoiceHtml(invoice, seller)) + "\""
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(frontendWebBaseUrl + "/api/send-email"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                    .exceptionally(e -> {
                        log.warn("Failed to send invoice email for {}: {}",
                                invoice.getInvoiceNumber(), e.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Failed to build/send invoice email for {}: {}",
                    invoice.getInvoiceNumber(), e.getMessage());
        }
    }

    private String jsonEscape(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String buildInvoiceHtml(Invoice invoice, Business seller) {
        String dueDateRow = invoice.getDueDate() != null
                ? "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Due date: " + invoice.getDueDate() + "</p>"
                : "";
        return "<div style=\"font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #f8fafc;\">"
                + "<div style=\"background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 20px; padding: 40px; margin-bottom: 24px; text-align: center;\">"
                + "<h1 style=\"color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px;\">Invoice " + invoice.getInvoiceNumber() + "</h1>"
                + "<p style=\"color: #94a3b8; margin: 0;\">from " + seller.getName() + "</p>"
                + "</div>"
                + "<div style=\"background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #f1f5f9;\">"
                + "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Amount: <strong>$" + invoice.getTotalUsd() + "</strong></p>"
                + "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Payment mode: " + invoice.getPaymentMode() + "</p>"
                + dueDateRow
                + "<p style=\"color: #374151; font-size: 15px; margin: 0;\">Status: " + invoice.getStatus() + "</p>"
                + "</div>"
                + "<p style=\"text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;\">StockFlow Pro</p>"
                + "</div>";
    }
}
