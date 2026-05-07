package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.dto.EnrollmentDto.*;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.entity.EnrollmentStatus;
import com.elc.system.modules.lms.exception.InvalidClassStatusException;
import com.elc.system.modules.finance.entity.Invoice;
import com.elc.system.modules.finance.entity.InvoiceStatus;
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
    private final com.elc.system.modules.finance.repository.InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByClass(UUID classId) {
        return enrollmentRepository.findByClazzId(classId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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

    @Transactional
    public EnrollmentResponse transferClass(UUID enrollmentId, TransferClassRequest request) {
        if (request.getTargetClassId() == null) {
            throw new RuntimeException("Target class is required");
        }

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        Clazz targetClass = clazzRepository.findById(request.getTargetClassId())
                .orElseThrow(() -> new RuntimeException("Target class not found"));

        if (enrollment.getClazz().getId().equals(targetClass.getId())) {
            return mapToResponse(enrollment);
        }

        validateClassForEnrollment(targetClass);

        UUID studentId = enrollment.getStudent().getId();
        if (enrollmentRepository.existsByStudentIdAndClazzId(studentId, targetClass.getId())) {
            throw new RuntimeException("Student is already enrolled in target class");
        }

        validateClassCapacity(targetClass);
        enrollment.setClazz(targetClass);
        enrollment.setStatus(EnrollmentStatus.ACTIVE);

        return mapToResponse(enrollmentRepository.save(enrollment));
    }

    private void validateClassForEnrollment(Clazz clazz) {
        // Check class status
        if (clazz.getStatus() != ClassStatus.ACCEPTING
                && clazz.getStatus() != ClassStatus.UPCOMING
                && clazz.getStatus() != ClassStatus.ONGOING) {
            throw new InvalidClassStatusException(
                    "Cannot enroll in class with status: " + clazz.getStatus() +
                            ". Enrollment is only allowed for ACCEPTING, UPCOMING or ONGOING classes.");
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

    private void validateClassCapacity(Clazz clazz) {
        long currentEnrolled = enrollmentRepository.findByClazzId(clazz.getId()).stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE || e.getStatus() == EnrollmentStatus.PENDING)
                .count();

        if (currentEnrolled >= clazz.getMaxStudents()) {
            throw new RuntimeException("Class is full. Current enrollment: " + currentEnrolled + ", Max capacity: " + clazz.getMaxStudents());
        }
    }

    @Transactional
    public void updateStatus(UUID id, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        boolean wasNotActive = enrollment.getStatus() != EnrollmentStatus.ACTIVE;
        
        enrollment.setStatus(status);
        enrollmentRepository.save(enrollment);

        // Nếu chuyển sang ACTIVE (đã duyệt), tự động tạo hóa đơn
        if (wasNotActive && status == EnrollmentStatus.ACTIVE) {
            createInvoiceForEnrollment(enrollment);
        }
    }

    private void createInvoiceForEnrollment(Enrollment enrollment) {
        // Kiểm tra xem đã có hóa đơn chưa để tránh tạo trùng
        if (!invoiceRepository.findByEnrollmentId(enrollment.getId()).isEmpty()) {
            return;
        }

        java.math.BigDecimal amount = enrollment.getClazz().getCourse().getBasePrice();
        if (amount == null) amount = java.math.BigDecimal.ZERO;

        Invoice invoice = Invoice.builder()
                .enrollment(enrollment)
                .totalAmount(amount)
                .discountAmount(java.math.BigDecimal.ZERO)
                .finalAmount(amount)
                .dueDate(LocalDate.now().plusDays(7)) 
                .status(InvoiceStatus.UNPAID)
                .build();
        invoiceRepository.save(invoice);
    }

    private EnrollmentResponse mapToResponse(Enrollment enrollment) {
        User teacher = enrollment.getClazz().getTeacher();
        String teacherName = teacher != null ? teacher.getFullName() : "Đang cập nhật";
        String teacherEmail = teacher != null ? teacher.getEmail() : null;
        String teacherPhone = teacher != null ? teacher.getPhone() : null;
                
        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .studentId(enrollment.getStudent().getId())
                .studentName(enrollment.getStudent().getFullName())
                .classId(enrollment.getClazz().getId())
                .className(enrollment.getClazz().getName())
                .teacherName(teacherName)
                .teacherEmail(teacherEmail)
                .teacherPhone(teacherPhone)
                .enrollmentDate(enrollment.getEnrollmentDate())
                .status(enrollment.getStatus())
                .build();
    }
}
