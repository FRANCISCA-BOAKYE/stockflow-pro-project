package com.stockflow.stockflowbackend.pos;

import com.stockflow.stockflowbackend.model.Invoice;
import org.springframework.dao.DataIntegrityViolationException;

/**
 * Invoice numbers are derived from a per-business count, which is not atomic
 * under concurrent sales. Retries on a unique-constraint violation with an
 * incremented suffix instead of letting the whole sale fail.
 */
public final class InvoiceNumberUtil {

    private static final int MAX_ATTEMPTS = 5;

    private InvoiceNumberUtil() {}

    public static Invoice saveWithUniqueNumber(InvoiceRepository invoiceRepository,
                                               Long sellerBusinessId,
                                               Invoice invoice) {
        long baseCount = invoiceRepository.countBySellerBusinessId(sellerBusinessId);
        for (int attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            invoice.setInvoiceNumber("SF-" + sellerBusinessId + "-"
                    + String.format("%05d", baseCount + 1 + attempt));
            try {
                return invoiceRepository.saveAndFlush(invoice);
            } catch (DataIntegrityViolationException e) {
                if (attempt == MAX_ATTEMPTS - 1) {
                    throw e;
                }
            }
        }
        throw new IllegalStateException("Unreachable");
    }
}
