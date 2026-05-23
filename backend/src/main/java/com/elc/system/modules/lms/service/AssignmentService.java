package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.lms.dto.AssignmentDto.*;
import com.elc.system.modules.lms.entity.Assignment;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.repository.AssignmentRepository;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ClazzRepository clazzRepository;
    private final EnrollmentRepository enrollmentRepository; // ✅ FIXED: Added for student enrollment check

    // ✅ SECURE: Added User parameter for access control check
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByClass(UUID classId, User currentUser) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // ✅ FIXED: Check if user has permission to view assignments for this class
        if (currentUser.getRole() == UserRole.TEACHER) {
            if (clazz.getTeacher() == null || !clazz.getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view assignments for your own classes");
            }
        } else if (currentUser.getRole() == UserRole.STUDENT) {
            // Students can only view assignments for classes they're enrolled in
            if (!enrollmentRepository.existsByStudentIdAndClazzId(currentUser.getId(), classId)) {
                throw new AccessDeniedException("You can only view assignments for your enrolled classes");
            }
        }
        // Managers can view all assignments

        return assignmentRepository.findByClazzId(classId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByTeacher(UUID teacherId) {
        return assignmentRepository.findByClazzTeacherIdOrderByDueDateDesc(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request, User teacher) {
        Clazz clazz = clazzRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Assignment assignment = Assignment.builder()
                .clazz(clazz)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .fileUrl(request.getFileUrl())
                .externalLink(request.getExternalLink())
                .createdBy(teacher)
                .build();

        return mapToResponse(assignmentRepository.save(assignment));
    }

    private AssignmentResponse mapToResponse(Assignment assignment) {
        Clazz clazz = null;
        User createdBy = null;

        try {
            clazz = assignment.getClazz();
        } catch (RuntimeException ignored) {
            // Keep assignment visible even if class relation is inconsistent.
        }

        try {
            createdBy = assignment.getCreatedBy();
        } catch (RuntimeException ignored) {
            // Keep assignment visible even if creator relation is inconsistent.
        }

        return AssignmentResponse.builder()
                .id(assignment.getId())
                .classId(clazz != null ? safeUuid(clazz::getId) : null)
                .className(clazz != null ? safeString(clazz::getName) : null)
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .fileUrl(assignment.getFileUrl())
                .externalLink(assignment.getExternalLink())
                .createdById(createdBy != null ? safeUuid(createdBy::getId) : null)
                .createdByName(createdBy != null ? safeString(createdBy::getFullName) : null)
                .createdAt(assignment.getCreatedAt())
                .build();
    }

    private UUID safeUuid(SupplierWithRuntimeException<UUID> supplier) {
        try {
            return supplier.get();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private String safeString(SupplierWithRuntimeException<String> supplier) {
        try {
            return supplier.get();
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    @FunctionalInterface
    private interface SupplierWithRuntimeException<T> {
        T get();
    }
}
