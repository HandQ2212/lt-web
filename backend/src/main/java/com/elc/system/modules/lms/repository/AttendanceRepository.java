package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Attendance;
import com.elc.system.modules.lms.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    List<Attendance> findByEnrollmentId(UUID enrollmentId);
    Optional<Attendance> findByEnrollmentIdAndAttendanceDate(UUID enrollmentId, LocalDate date);
    List<Attendance> findByEnrollmentClazzId(UUID classId);
    List<Attendance> findByEnrollmentClazzIdAndAttendanceDate(UUID classId, LocalDate date);
    boolean existsByEnrollmentIdAndAttendanceDate(UUID enrollmentId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.status = :status")
    long countByStatus(@Param("status") AttendanceStatus status);

    @Query("SELECT COUNT(a) FROM Attendance a")
    long countTotal();
}
