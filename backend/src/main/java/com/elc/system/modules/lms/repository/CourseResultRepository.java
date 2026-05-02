package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.CourseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseResultRepository extends JpaRepository<CourseResult, UUID> {
    Optional<CourseResult> findByEnrollmentId(UUID enrollmentId);

    @org.springframework.data.jpa.repository.Query("SELECT AVG(c.midtermScore) FROM CourseResult c WHERE c.midtermScore IS NOT NULL")
    Double getAverageMidtermScore();

    @org.springframework.data.jpa.repository.Query("SELECT AVG(c.finalScore) FROM CourseResult c WHERE c.finalScore IS NOT NULL")
    Double getAverageFinalScore();

    @org.springframework.data.jpa.repository.Query("SELECT c.finalGrade, COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL GROUP BY c.finalGrade")
    java.util.List<Object[]> getGradeDistribution();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL")
    long countTotalGraded();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL AND UPPER(c.finalGrade) <> 'F'")
    long countPass();
}
