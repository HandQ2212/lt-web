package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.dto.EnrollmentDto.EnrollmentRequest;
import com.elc.system.modules.lms.dto.EnrollmentDto.EnrollmentResponse;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;
    private final UserRepository userRepository;

    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getEnrollmentsByClass(UUID classId) {
        return enrollmentRepository.findByClazzId(classId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EnrollmentResponse> getEnrollmentsByStudent(UUID studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request) {
        if (enrollmentRepository.existsByStudentIdAndClazzId(request.getStudentId(), request.getClassId())) {
            throw new RuntimeException("Student is already enrolled in this class");
        }

        Clazz clazz = clazzRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Basic capacity check
        long currentEnrolled = enrollmentRepository.findByClazzId(request.getClassId()).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.PENDING)
                .count();

        if (currentEnrolled >= clazz.getMaxStudents()) {
            throw new RuntimeException("Class is full");
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .clazz(clazz)
                .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : java.time.LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : EnrollmentStatus.PENDING)
                .build();

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public void updateStatus(UUID id, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setStatus(status);
        enrollmentRepository.save(enrollment);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFullName())
                .classId(enrollment.getClazz().getId())
                .className(enrollment.getClazz().getName())
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .build();
    }
}
