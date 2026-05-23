package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.AttendanceDto.*;
import com.elc.system.modules.lms.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/{classId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClass(
            @PathVariable UUID classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClass(classId, date, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view this class's attendance
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AttendanceResponse> markAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/report/monthly")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AttendanceReportResponse> getMonthlyReport(
            @RequestParam UUID studentId,
            @RequestParam UUID classId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(attendanceService.getMonthlyReport(studentId, classId, year, month, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view this student's attendance report
    }

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/enrollment/{enrollmentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByEnrollment(
            @PathVariable UUID enrollmentId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEnrollment(enrollmentId, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view this enrollment's attendance
    }
}
