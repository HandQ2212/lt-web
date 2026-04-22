package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.AssignmentDto.AssignmentRequest;
import com.elc.system.modules.lms.dto.AssignmentDto.AssignmentResponse;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionRequest;
import com.elc.system.modules.lms.dto.SubmissionDto.SubmissionResponse;
import com.elc.system.modules.lms.service.AssignmentService;
import com.elc.system.modules.lms.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SubmissionService submissionService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(assignmentService.createAssignment(request, teacher));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmissionResponse> submitWork(
            @PathVariable UUID id,
            @Valid @RequestBody SubmissionRequest request,
            @AuthenticationPrincipal User student) {
        request.setAssignmentId(id);
        return ResponseEntity.ok(submissionService.submitWork(request, student));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(@PathVariable UUID id) {
        return ResponseEntity.ok(submissionService.getSubmissionsByAssignment(id));
    }
}
