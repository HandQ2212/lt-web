package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.AttendanceDto.*;
import com.elc.system.modules.lms.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/{classId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClass(
            @PathVariable UUID classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClass(classId, date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<AttendanceResponse> markAttendance(@Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    @GetMapping("/report/monthly")
    public ResponseEntity<AttendanceReportResponse> getMonthlyReport(
            @RequestParam UUID studentId,
            @RequestParam UUID classId,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(attendanceService.getMonthlyReport(studentId, classId, year, month));
    }

    @GetMapping("/enrollment/{enrollmentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByEnrollment(enrollmentId));
    }
}
