package com.elc.system.modules.lms.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.lms.dto.AttendanceDto.*;
import com.elc.system.modules.lms.entity.Attendance;
import com.elc.system.modules.lms.entity.AttendanceStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.repository.AttendanceRepository;
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EnrollmentRepository enrollmentRepository,
            ClazzRepository clazzRepository) {
        this.attendanceRepository = attendanceRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.clazzRepository = clazzRepository;
    }

    // ✅ SECURE: Added User parameter for access control check
    public List<AttendanceResponse> getAttendanceByClass(UUID classId, LocalDate date, User currentUser) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // ✅ FIXED: Check if user has permission to view this class's attendance
        if (currentUser.getRole() == UserRole.TEACHER) {
            if (clazz.getTeacher() == null || !clazz.getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view attendance for your own classes");
            }
        } else if (currentUser.getRole() == UserRole.STUDENT) {
            // Students can only view attendance for classes they're enrolled in
            if (!enrollmentRepository.existsByStudentIdAndClazzId(currentUser.getId(), classId)) {
                throw new AccessDeniedException("You can only view attendance for your enrolled classes");
            }
        }
        // Managers can view all attendance

        List<Attendance> attendanceList = date != null
                ? attendanceRepository.findByEnrollmentClazzIdAndAttendanceDate(classId, date)
                : attendanceRepository.findByEnrollmentClazzId(classId);

        return attendanceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ SECURE: Added User parameter for access control check
    public List<AttendanceResponse> getAttendanceByEnrollment(UUID enrollmentId, User currentUser) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // ✅ FIXED: Check if user has permission to view this enrollment's attendance
        if (currentUser.getRole() == UserRole.STUDENT) {
            if (!enrollment.getStudent().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view your own attendance records");
            }
        } else if (currentUser.getRole() == UserRole.TEACHER) {
            // Teachers can only view attendance for their own classes
            if (enrollment.getClazz().getTeacher() == null ||
                !enrollment.getClazz().getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view attendance for your own classes");
            }
        }
        // Managers can view all attendance

        return attendanceRepository.findByEnrollmentId(enrollmentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

        @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        LocalDate date = request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEnrollmentIdAndAttendanceDate(request.getEnrollmentId(), date)
                .orElse(null);

        if (attendance != null) {
            attendance.setStatus(request.getStatus() != null ? request.getStatus() : AttendanceStatus.PRESENT);
            attendance.setNotes(request.getNotes());
        } else {
            Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            attendance = Attendance.builder()
                    .enrollment(enrollment)
                    .attendanceDate(request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now())
                    .status(request.getStatus() != null ? request.getStatus() : AttendanceStatus.PRESENT)
                    .notes(request.getNotes())
                    .build();
        }

        return mapToResponse(attendanceRepository.save(attendance));
    }

    // ✅ SECURE: Added User parameter for access control check
    public AttendanceReportResponse getMonthlyReport(UUID studentId, UUID classId, Integer year, Integer month, User currentUser) {
        // Validate enrollment exists
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndClazzId(studentId, classId)
                .orElseThrow(() -> new RuntimeException("Student not enrolled in this class"));

        // Get class info
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        // ✅ FIXED: Check if user has permission to view this student's attendance report
        if (currentUser.getRole() == UserRole.STUDENT) {
            if (!studentId.equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view your own attendance reports");
            }
        } else if (currentUser.getRole() == UserRole.TEACHER) {
            if (clazz.getTeacher() == null || !clazz.getTeacher().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You can only view attendance reports for your own classes");
            }
        }
        // Managers can view all attendance reports

        // Determine date range for the month
        YearMonth yearMonth = year != null && month != null
                ? YearMonth.of(year, month)
                : YearMonth.now();

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // Get all attendance records for the student in this class for the month
        List<Attendance> attendanceList = attendanceRepository.findByEnrollmentId(enrollment.getId()).stream()
                .filter(a -> !a.getAttendanceDate().isBefore(startDate) && !a.getAttendanceDate().isAfter(endDate))
                .collect(Collectors.toList());

        // Count by status
        long presentCount = attendanceList.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
        long absentCount = attendanceList.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
        long excusedCount = attendanceList.stream().filter(a -> a.getStatus() == AttendanceStatus.EXCUSED).count();
        long lateCount = attendanceList.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();

        // Calculate attendance rate
        // Formula: (Present + Excused) / Total Sessions
        // Note: Canceled classes should not affect denominator (they won't have attendance records)
        long totalSessions = attendanceList.size();
        double attendanceRate = totalSessions > 0
                ? (double) (presentCount + excusedCount) / totalSessions * 100
                : 0.0;

        // Build daily records
        List<DailyAttendanceRecord> dailyRecords = attendanceList.stream()
                .map(a -> DailyAttendanceRecord.builder()
                        .date(a.getAttendanceDate())
                        .status(a.getStatus())
                        .notes(a.getNotes())
                        .build())
                .collect(Collectors.toList());

        return AttendanceReportResponse.builder()
                .studentId(studentId)
                .studentName(enrollment.getStudent().getFullName())
                .classId(classId)
                .className(clazz.getName())
                .year(yearMonth.getYear())
                .month(yearMonth.getMonthValue())
                .totalSessions(totalSessions)
                .presentCount(presentCount)
                .absentCount(absentCount)
                .excusedCount(excusedCount)
                .lateCount(lateCount)
                .attendanceRate(Math.round(attendanceRate * 100.0) / 100.0) // Round to 2 decimal places
                .dailyRecords(dailyRecords)
                .build();
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .enrollmentId(attendance.getEnrollment().getId())
                .studentName(attendance.getEnrollment().getStudent().getFullName())
                .attendanceDate(attendance.getAttendanceDate())
                .status(attendance.getStatus())
                .notes(attendance.getNotes())
                .build();
    }
}
