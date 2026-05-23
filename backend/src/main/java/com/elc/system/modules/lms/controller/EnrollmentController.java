package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.EnrollmentDto.*;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByClass(
            @PathVariable UUID classId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByClass(classId, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view enrollments for this class
    }

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(
            @PathVariable UUID studentId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view enrollments for this student
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EnrollmentResponse> enrollStudent(@Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam EnrollmentStatus status) {
        enrollmentService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/class")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<EnrollmentResponse> transferClass(
            @PathVariable UUID id,
            @Valid @RequestBody TransferClassRequest request
    ) {
        return ResponseEntity.ok(enrollmentService.transferClass(id, request));
    }
}
