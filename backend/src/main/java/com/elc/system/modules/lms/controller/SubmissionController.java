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

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(@PathVariable UUID assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(assignmentId));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitWork(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.submitWork(request, student));
    }

    @PutMapping("/{id}/grade")
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request));
    }
}
