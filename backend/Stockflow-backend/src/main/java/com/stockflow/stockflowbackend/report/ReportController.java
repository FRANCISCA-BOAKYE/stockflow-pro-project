package com.stockflow.stockflowbackend.report;

import com.stockflow.stockflowbackend.dto.DashboardResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    private Long getBusinessId(Authentication authentication) {
        return (Long) authentication.getDetails();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            Authentication authentication) {
        return ResponseEntity.ok(reportService.getDashboard(
                getBusinessId(authentication)));
    }
}