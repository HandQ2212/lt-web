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
        Clazz clazz = assignment.getClazz();
        User createdBy = assignment.getCreatedBy();

        return AssignmentResponse.builder()
                .id(assignment.getId())
                .classId(clazz != null ? clazz.getId() : null)
                .className(clazz != null ? clazz.getName() : null)
                .title(assignment.getTitle())
                .description(assignment.getDescription())
                .dueDate(assignment.getDueDate())
                .fileUrl(assignment.getFileUrl())
                .externalLink(assignment.getExternalLink())
                .createdById(createdBy != null ? createdBy.getId() : null)
                .createdByName(createdBy != null ? createdBy.getFullName() : null)
                .createdAt(assignment.getCreatedAt())
                .build();
    }
}
