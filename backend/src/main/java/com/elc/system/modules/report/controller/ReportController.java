package com.elc.system.modules.report.controller;

import com.elc.system.modules.report.dto.ReportDto.*;
import com.elc.system.modules.report.service.ExcelExportService;
import com.elc.system.modules.report.service.ReportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ExcelExportService excelExportService;

    /** Revenue report (JSON for charts) */
    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<RevenueReport> getRevenueReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(reportService.getRevenueReport(year, month));
    }

    /** Expense report (JSON for charts) */
    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<ExpenseReport> getExpenseReport(
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(reportService.getExpenseReport(year, month));
    }

    /** Net profit report */
    @GetMapping("/profit")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ProfitReport> getProfitReport(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(reportService.getProfitReport(year, month));
    }

    /** Manager dashboard summary */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<DashboardSummary> getDashboard() {
        return ResponseEntity.ok(reportService.getDashboard());
    }

    // ============ Excel Export Endpoints ============

    /** Export revenue report as Excel */
    @GetMapping("/revenue/export")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public void exportRevenueExcel(
            @RequestParam int year,
            @RequestParam(required = false) Integer month,
            HttpServletResponse response) throws IOException {
        excelExportService.exportRevenueReport(year, month, response);
    }

    /** Export payroll report as Excel */
    @GetMapping("/salary/export")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public void exportPayrollExcel(
            @RequestParam int month,
            @RequestParam int year,
            HttpServletResponse response) throws IOException {
        excelExportService.exportPayrollReport(month, year, response);
    }
}
