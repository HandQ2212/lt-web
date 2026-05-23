package com.elc.system.modules.analytics.controller;

import com.elc.system.modules.analytics.dto.ReportDto.*;
import com.elc.system.modules.analytics.dto.RevenueAnalyticsDto;
import com.elc.system.modules.analytics.service.AnalyticsService;
import com.elc.system.modules.analytics.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ACCOUNTANT')")
public class ReportController {

    private final AnalyticsService analyticsService;
    private final ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<RevenueAnalyticsDto> getRevenueReport() {
        return ResponseEntity.ok(analyticsService.getRevenueReport());
    }

    @GetMapping("/expenses")
    public ResponseEntity<ExpenseReportDTO> getExpenseReport() {
        return ResponseEntity.ok(reportService.getExpenseReport());
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<PLReportDTO> getPLReport() {
        return ResponseEntity.ok(reportService.getPLReport());
    }

    @GetMapping("/conversion")
    public ResponseEntity<ConversionReportDTO> getConversionReport() {
        return ResponseEntity.ok(reportService.getConversionReport());
    }

    @GetMapping("/top-courses")
    public ResponseEntity<List<CourseReportDTO>> getTopCoursesReport() {
        return ResponseEntity.ok(reportService.getTopCoursesReport());
    }

    @GetMapping("/churn-rate")
    public ResponseEntity<ChurnReportDTO> getChurnReport() {
        return ResponseEntity.ok(reportService.getChurnReport());
    }
}
