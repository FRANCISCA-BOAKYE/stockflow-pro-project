package com.stockflow.stockflowbackend.email;

/**
 * Shared branded HTML wrapper so every outbound email (welcome, invite,
 * security notices, invoices) looks like one product instead of ad-hoc markup.
 */
public class EmailTemplateUtil {

    private EmailTemplateUtil() {}

    public static String wrap(String heading, String subheading, String bodyHtml) {
        return "<div style=\"font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; background: #f8fafc;\">"
                + "<div style=\"background: linear-gradient(135deg, #0f172a, #1e1b4b); border-radius: 20px; padding: 40px; margin-bottom: 24px; text-align: center;\">"
                + "<h1 style=\"color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px;\">" + heading + "</h1>"
                + (subheading != null ? "<p style=\"color: #94a3b8; margin: 0;\">" + subheading + "</p>" : "")
                + "</div>"
                + "<div style=\"background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #f1f5f9;\">"
                + bodyHtml
                + "</div>"
                + "<p style=\"text-align: center; font-size: 12px; color: #94a3b8; margin-top: 24px;\">StockFlow Pro</p>"
                + "</div>";
    }

    public static String paragraph(String text) {
        return "<p style=\"color: #374151; font-size: 15px; margin: 0 0 12px; line-height: 1.5;\">" + text + "</p>";
    }

    public static String smallNote(String text) {
        return "<p style=\"color: #9ca3af; font-size: 13px; margin: 16px 0 0;\">" + text + "</p>";
    }

    public static String credentialBox(String label1, String value1, String label2, String value2) {
        return "<div style=\"background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 12px 0;\">"
                + "<p style=\"color: #6b7280; font-size: 12px; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.05em;\">" + label1 + "</p>"
                + "<p style=\"color: #0f172a; font-size: 16px; font-weight: 700; margin: 0 0 12px;\">" + value1 + "</p>"
                + "<p style=\"color: #6b7280; font-size: 12px; margin: 0 0 2px; text-transform: uppercase; letter-spacing: 0.05em;\">" + label2 + "</p>"
                + "<p style=\"color: #0f172a; font-size: 16px; font-weight: 700; margin: 0;\">" + value2 + "</p>"
                + "</div>";
    }

    public static String button(String url, String label) {
        return "<div style=\"text-align: center; margin: 24px 0 8px;\">"
                + "<a href=\"" + url + "\" style=\"display: inline-block; background: #1a56db; color: #ffffff; "
                + "font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 12px;\">"
                + label + "</a></div>";
    }
}
