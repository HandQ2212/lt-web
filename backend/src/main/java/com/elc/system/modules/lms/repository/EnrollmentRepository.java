package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(@org.springframework.data.repository.query.Param("studentId") UUID studentId);

    List<Enrollment> findByClazzId(UUID classId);
    boolean existsByStudentIdAndClazzId(UUID studentId, UUID classId);
    Optional<Enrollment> findByStudentIdAndClazzId(UUID studentId, UUID classId);

    long countByClazzBranchId(UUID branchId);
}
