package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    @Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE e.student.id = :studentId")
    List<Enrollment> findByStudentId(@Param("studentId") UUID studentId);

    @Query("SELECT e FROM Enrollment e JOIN FETCH e.clazz c LEFT JOIN FETCH c.teacher WHERE c.id = :classId")
    List<Enrollment> findByClazzId(@Param("classId") UUID classId);
    
    boolean existsByStudentIdAndClazzId(UUID studentId, UUID classId);
    Optional<Enrollment> findByStudentIdAndClazzId(UUID studentId, UUID classId);

    long countByClazzBranchId(UUID branchId);
}
