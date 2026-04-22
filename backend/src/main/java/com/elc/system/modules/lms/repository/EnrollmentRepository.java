package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {
    List<Enrollment> findByStudentId(UUID studentId);
    List<Enrollment> findByClazzId(UUID classId);
    boolean existsByStudentIdAndClazzId(UUID studentId, UUID classId);
}
