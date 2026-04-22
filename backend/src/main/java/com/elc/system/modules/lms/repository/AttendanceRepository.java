package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByEnrollmentId(UUID enrollmentId);
    List<Attendance> findByEnrollmentClazzIdAndAttendanceDate(UUID classId, LocalDate date);
    boolean existsByEnrollmentIdAndAttendanceDate(UUID enrollmentId, LocalDate date);
}
