package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.lms.dto.AssignmentDto.*;
import com.elc.system.modules.lms.entity.Assignment;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.repository.AssignmentRepository;
import com.elc.system.modules.lms.repository.ClazzRepository;
import lombok.RequiredArgsConstructor;
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

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByClass(UUID classId) {
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
