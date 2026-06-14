package com.stockflow.stockflowbackend.pos;

import com.stockflow.stockflowbackend.dto.InvoiceDTO;
import com.stockflow.stockflowbackend.dto.POSRequest;
import com.stockflow.stockflowbackend.dto.POSResponse;
import com.stockflow.stockflowbackend.model.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pos")
public class POSController {

    private final POSService posService;
    private final InvoiceRepository invoiceRepository;

    public POSController(POSService posService,
                         InvoiceRepository invoiceRepository) {
        this.posService = posService;
        this.invoiceRepository = invoiceRepository;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @PostMapping("/retail")
    public ResponseEntity<POSResponse> retailSale(
            @RequestBody POSRequest request,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        return ResponseEntity.ok(
                posService.processRetailSale(request, businessId, businessId));
    }

    @GetMapping("/invoices")
    @Transactional(readOnly = true)
    public ResponseEntity<Page<InvoiceDTO>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        Long businessId = getBusinessId(authentication);
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by("createdAt").descending());

        Page<Invoice> invoices;
        if (status != null && !status.isEmpty()) {
            invoices = invoiceRepository.findBySellerBusinessIdAndStatus(
                    businessId, status, pageable);
        } else {
            invoices = invoiceRepository
                    .findBySellerBusinessIdOrderByCreatedAtDesc(
                            businessId, pageable);
        }

        return ResponseEntity.ok(invoices.map(InvoiceDTO::new));
    }
}