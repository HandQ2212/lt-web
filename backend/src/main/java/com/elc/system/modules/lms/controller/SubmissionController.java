package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.SubmissionDto.GradeRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionResponse;
import com.elc.system.modules.lms.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<SubmissionResponse> submitWork(
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(submissionService.submitWork(request, student));
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable UUID id,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.gradeSubmission(id, request));
    }
}
