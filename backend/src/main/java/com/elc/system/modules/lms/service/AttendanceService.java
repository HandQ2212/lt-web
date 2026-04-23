package com.elc.system.modules.lms.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final ClazzRepository clazzRepository;

    public List<AttendanceResponse> getAttendanceByClass(UUID classId, LocalDate date) {
        return attendanceRepository.findByEnrollmentClazzIdAndAttendanceDate(classId, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request) {
        // If record exists, update it. If not, create new.
        Attendance attendance = attendanceRepository.findByEnrollmentId(request.getEnrollmentId()).stream()
                .filter(a -> a.getAttendanceDate().equals(request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now()))
                .findFirst()
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

    public AttendanceReportResponse getMonthlyReport(UUID studentId, UUID classId, Integer year, Integer month) {
        // Validate enrollment exists
        Enrollment enrollment = enrollmentRepository.findByStudentIdAndClazzId(studentId, classId)
                .orElseThrow(() -> new RuntimeException("Student not enrolled in this class"));

        // Get class info
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

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
