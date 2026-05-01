package com.elc.system.modules.lms.controller;

import com.elc.system.modules.lms.dto.EnrollmentDto.*;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByClass(classId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponse>> getEnrollmentsByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> enrollStudent(@Valid @RequestBody EnrollmentRequest request) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam EnrollmentStatus status) {
        enrollmentService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
