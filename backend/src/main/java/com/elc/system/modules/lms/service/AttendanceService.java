package com.elc.system.modules.lms.service;

import com.elc.system.modules.lms.dto.AttendanceDto.AttendanceRequest;
import com.elc.system.modules.lms.dto.AttendanceDto.AttendanceResponse;
import com.elc.system.modules.lms.entity.Attendance;
import com.elc.system.modules.lms.entity.Enrollment;
import com.elc.system.modules.lms.repository.AttendanceRepository;
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
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EnrollmentRepository enrollmentRepository;

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
            attendance.setPresent(request.isPresent());
            attendance.setNotes(request.getNotes());
        } else {
            Enrollment enrollment = enrollmentRepository.findById(request.getEnrollmentId())
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));

            attendance = Attendance.builder()
                    .enrollment(enrollment)
                    .attendanceDate(request.getAttendanceDate() != null ? request.getAttendanceDate() : LocalDate.now())
                    .present(request.isPresent())
                    .notes(request.getNotes())
                    .build();
        }

        return mapToResponse(attendanceRepository.save(attendance));
    }

    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .enrollmentId(attendance.getEnrollment().getId())
                .studentName(attendance.getEnrollment().getStudent().getFullName())
                .attendanceDate(attendance.getAttendanceDate())
                .present(attendance.isPresent())
                .notes(attendance.getNotes())
                .build();
    }
}
