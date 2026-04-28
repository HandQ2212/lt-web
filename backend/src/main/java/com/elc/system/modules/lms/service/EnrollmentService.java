package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.dto.EnrollmentDto.EnrollmentRequest;
import com.elc.system.modules.lms.dto.EnrollmentDto.EnrollmentResponse;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.exception.InvalidClassStatusException;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;
    private final UserRepository userRepository;

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
        // Validate student exists
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Validate class exists and is enrollable
        Clazz clazz = clazzRepository.findById(request.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // Validate class status for enrollment
        validateClassForEnrollment(clazz);

        // Check for existing enrollment
        if (enrollmentRepository.existsByStudentIdAndClazzId(request.getStudentId(), request.getClassId())) {
            throw new RuntimeException("Student is already enrolled in this class");
        }

        // Validate capacity
        long currentEnrolled = enrollmentRepository.findByClazzId(request.getClassId()).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.PENDING)
                .count();

        if (currentEnrolled >= clazz.getMaxStudents()) {
            throw new RuntimeException("Class is full. Current enrollment: " + currentEnrolled + ", Max capacity: " + clazz.getMaxStudents());
        }

        // Create enrollment
        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .clazz(clazz)
                .enrollmentDate(request.getEnrollmentDate() != null ? request.getEnrollmentDate() : LocalDate.now())
                .status(request.getStatus() != null ? request.getStatus() : EnrollmentStatus.PENDING)
                .build();

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    private void validateClassForEnrollment(Clazz clazz) {
        // Check class status
        if (clazz.getStatus() != ClassStatus.UPCOMING && clazz.getStatus() != ClassStatus.ONGOING) {
            throw new InvalidClassStatusException(
                    "Cannot enroll in class with status: " + clazz.getStatus() +
                            ". Enrollment is only allowed for UPCOMING or ONGOING classes.");
        }

        // Check if class has already ended
        if (clazz.getEndDate() != null && clazz.getEndDate().isBefore(LocalDate.now())) {
            throw new InvalidClassStatusException("Cannot enroll in class that has already ended. End date: " + clazz.getEndDate());
        }

        // Check if class is cancelled
        if (clazz.getStatus() == ClassStatus.CANCELLED) {
            throw new InvalidClassStatusException("Cannot enroll in cancelled class.");
        }
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
