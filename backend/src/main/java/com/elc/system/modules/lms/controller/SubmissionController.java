package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.SubmissionDto.*;
import com.elc.system.modules.lms.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // ✅ SECURE: Added @PreAuthorize and @AuthenticationPrincipal for access control
    @GetMapping("/assignment/{assignmentId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER', 'STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(
            @PathVariable UUID assignmentId,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId, currentUser));
        // ✅ FIXED: Service layer now checks if user has permission to view submissions for this assignment
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.getSubmissionsByStudent(student.getId()));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitWork(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.submitWork(request, student));
    }

    // ✅ SECURE: Added @AuthenticationPrincipal to pass teacher for authorization check
    @PutMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody GradeRequest request,
            @AuthenticationPrincipal User teacher
    ) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request, teacher));
        // ✅ FIXED: Service layer now checks if teacher has permission to grade this submission
    }
}
