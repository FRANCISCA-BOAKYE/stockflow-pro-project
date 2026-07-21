package com.stockflow.stockflowbackend.email;

import com.stockflow.stockflowbackend.auth.UserRepository;
import com.stockflow.stockflowbackend.model.AppUser;
import com.stockflow.stockflowbackend.model.Business;
import com.stockflow.stockflowbackend.model.Invoice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Emails a copy of an invoice to the buyer business. Every invoice involves
 * real money, so this runs for every plan/tier — it is intentionally not
 * gated behind a premium feature.
 */
@Service
public class InvoiceEmailService {

    private static final Logger log = LoggerFactory.getLogger(InvoiceEmailService.class);

    private final UserRepository userRepository;
    private final EmailSenderService emailSenderService;

    public InvoiceEmailService(UserRepository userRepository,
                               EmailSenderService emailSenderService) {
        this.userRepository = userRepository;
        this.emailSenderService = emailSenderService;
    }

    public void sendIfEligible(Invoice invoice, Business seller) {
        try {
            if (invoice.getBuyerBusiness() == null) {
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

    /** Sends the order ID + pickup code to a buyer's email, in addition to the normal invoice. */
    public void sendPickupNotification(Invoice invoice, Business seller, String buyerEmail) {
        try {
            if (buyerEmail == null || buyerEmail.isBlank() || invoice.getPickupCode() == null) {
                return;
            }
            emailSenderService.sendAsync(
                    buyerEmail,
                    "Your order is ready for pickup — " + invoice.getInvoiceNumber(),
                    EmailTemplateUtil.wrap(
                            "Ready for pickup",
                            seller.getName(),
                            EmailTemplateUtil.paragraph("Your order is ready. Show this code when you arrive to collect it.")
                                    + EmailTemplateUtil.credentialBox("Order ID", invoice.getInvoiceNumber(),
                                            "Pickup code", invoice.getPickupCode())
                                    + EmailTemplateUtil.smallNote("Keep this email — you may be asked for the pickup code at collection.")));
        } catch (Exception e) {
            log.warn("Failed to send pickup notification for {}: {}", invoice.getInvoiceNumber(), e.getMessage());
        }
    }

    private String buildInvoiceHtml(Invoice invoice, Business seller) {
        String dueDateRow = invoice.getDueDate() != null
                ? "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Due date: " + invoice.getDueDate() + "</p>"
                : "";

        StringBuilder itemsHtml = new StringBuilder();
        if (invoice.getItems() != null && !invoice.getItems().isEmpty()) {
            itemsHtml.append("<table style=\"width: 100%; border-collapse: collapse; margin: 0 0 16px;\">");
            itemsHtml.append("<tr style=\"border-bottom: 1px solid #f1f5f9;\">")
                    .append("<td style=\"padding: 6px 0; font-size: 12px; color: #94a3b8;\">Item</td>")
                    .append("<td style=\"padding: 6px 0; font-size: 12px; color: #94a3b8; text-align: right;\">Qty</td>")
                    .append("<td style=\"padding: 6px 0; font-size: 12px; color: #94a3b8; text-align: right;\">Total</td></tr>");
            invoice.getItems().forEach(item -> itemsHtml.append("<tr style=\"border-bottom: 1px solid #f8fafc;\">")
                    .append("<td style=\"padding: 6px 0; font-size: 14px; color: #374151;\">").append(item.getProductName()).append("</td>")
                    .append("<td style=\"padding: 6px 0; font-size: 14px; color: #374151; text-align: right;\">").append(item.getQuantity()).append(" ").append(item.getUnit()).append("</td>")
                    .append("<td style=\"padding: 6px 0; font-size: 14px; color: #374151; text-align: right;\">$").append(item.getLineTotalUsd()).append("</td></tr>"));
            itemsHtml.append("</table>");
        }

        return "<div style=\"font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #f8fafc;\">"
                + "<div style=\"background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 20px; padding: 40px; margin-bottom: 24px; text-align: center;\">"
                + "<h1 style=\"color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px;\">Invoice " + invoice.getInvoiceNumber() + "</h1>"
                + "<p style=\"color: #94a3b8; margin: 0;\">from " + seller.getName() + "</p>"
                + "</div>"
                + "<div style=\"background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #f1f5f9;\">"
                + itemsHtml
                + "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Amount: <strong>$" + invoice.getTotalUsd() + "</strong></p>"
                + "<p style=\"color: #374151; font-size: 15px; margin: 0 0 8px;\">Payment mode: " + invoice.getPaymentMode() + "</p>"
                + dueDateRow
                + "<p style=\"color: #374151; font-size: 15px; margin: 0;\">Status: " + invoice.getStatus() + "</p>"
                + "</div>"
                + "<p style=\"text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;\">StockFlow Pro</p>"
                + "</div>";
    }
}
