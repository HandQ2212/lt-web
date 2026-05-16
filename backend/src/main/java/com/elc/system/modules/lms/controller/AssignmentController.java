package com.elc.system.modules.lms.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.AssignmentDto.*;
import com.elc.system.modules.lms.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByClass(@PathVariable UUID classId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId));
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('TEACHER', 'MANAGER')")
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(currentUser.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'TEACHER')")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(assignmentService.createAssignment(request, teacher));
    }
}
