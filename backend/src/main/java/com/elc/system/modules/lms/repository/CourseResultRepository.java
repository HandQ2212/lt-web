package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.CourseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseResultRepository extends JpaRepository<CourseResult, UUID> {
    Optional<CourseResult> findByEnrollmentId(UUID enrollmentId);
}
