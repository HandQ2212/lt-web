package com.elc.system.modules.analytics.controller;

import com.elc.system.modules.analytics.dto.AcademicAnalyticsDto;
import com.elc.system.modules.analytics.dto.BranchAnalyticsDto;
import com.elc.system.modules.analytics.dto.DashboardDto;
import com.elc.system.modules.analytics.dto.RevenueAnalyticsDto;
import com.elc.system.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final AnalyticsService analyticsService;

    @GetMapping("/revenue")
    public ResponseEntity<com.elc.system.modules.analytics.dto.RevenueAnalyticsDto> getRevenueReport() {
        return ResponseEntity.ok(analyticsService.getRevenueReport());
    }

    @GetMapping("/enrollment")
    public ResponseEntity<String> getEnrollmentStats() {
        // Mocking enrollment stats.
        return ResponseEntity.ok("{\"newStudents\": 150, \"classFillRate\": 85.5}");
    }

    @GetMapping("/performance")
    public ResponseEntity<AcademicAnalyticsDto> getAcademicReport() {
        return ResponseEntity.ok(analyticsService.getAcademicReport());
    }

    @GetMapping("/salary")
    public ResponseEntity<String> getSalaryPreview() {
        // Mocking salary calculation preview.
        return ResponseEntity.ok("{\"totalPayroll\": 125000000.00, \"teacherCount\": 25}");
    }

    @GetMapping("/branch-performance")
    public ResponseEntity<List<BranchAnalyticsDto>> getBranchPerformance() {
        return ResponseEntity.ok(analyticsService.getBranchPerformance());
    }
}
