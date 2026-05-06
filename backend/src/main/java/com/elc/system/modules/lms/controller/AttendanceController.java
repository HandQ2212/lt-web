package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.AttendanceDto.*;
import com.elc.system.modules.lms.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/{classId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClass(
            @PathVariable UUID classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByClass(classId, date));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
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
}
