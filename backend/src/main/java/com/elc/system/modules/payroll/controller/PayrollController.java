package com.elc.system.modules.payroll.controller;

import com.elc.system.modules.payroll.dto.PayrollDto.*;
import com.elc.system.modules.payroll.service.PayrollService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    /** Get payroll for a specific teacher */
    @GetMapping("/reports/salary")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<PayrollSummary> getMonthlyPayroll(
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.calculateMonthlyPayroll(month, year));
    }

    /** Get payroll for a specific teacher */
    @GetMapping("/reports/salary/{teacherId}")
    @PreAuthorize("hasAnyRole('ACCOUNTANT', 'MANAGER')")
    public ResponseEntity<PayrollResponse> getTeacherPayroll(
            @PathVariable UUID teacherId,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(payrollService.calculatePayroll(teacherId, month, year));
    }

    /** Create a bonus or penalty for a staff member */
    @PostMapping("/staff-adjustments")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<AdjustmentResponse> createAdjustment(
            @Valid @RequestBody CreateAdjustmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(payrollService.createAdjustment(request));
    }
}
