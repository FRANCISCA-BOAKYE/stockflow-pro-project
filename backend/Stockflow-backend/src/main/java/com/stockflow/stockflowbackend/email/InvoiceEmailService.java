package com.stockflow.stockflowbackend.email;

import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Invoice;
import com.stockflow.stockflowbackend.subscription.SubscriptionFeature;
import com.stockflow.stockflowbackend.subscription.SubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Emails a copy of an invoice to the buyer business, gated behind the
 * INVOICE_DELIVERY premium feature.
 */
@Service
public class InvoiceEmailService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceEmailService.class);

    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final EmailSenderService emailSenderService;

    public InvoiceEmailService(UserRepository userRepository,
                               SubscriptionService subscriptionService,
                               EmailSenderService emailSenderService) {
        this.userRepository = userRepository;
        this.subscriptionService = subscriptionService;
        this.emailSenderService = emailSenderService;
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

            emailSenderService.sendAsync(
                    recipient.get().getEmail(),
                    "Invoice " + invoice.getInvoiceNumber() + " from " + seller.getName(),
                    buildInvoiceHtml(invoice, seller));
        } catch (Exception e) {
            log.warn("Failed to build/send invoice email for {}: {}",
                    invoice.getInvoiceNumber(), e.getMessage());
        }
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
