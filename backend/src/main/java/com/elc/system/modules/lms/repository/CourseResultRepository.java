package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.CourseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseResultRepository extends JpaRepository<CourseResult, UUID> {
    Optional<CourseResult> findByEnrollmentId(UUID enrollmentId);

    @Query("SELECT AVG(c.midtermScore) FROM CourseResult c WHERE c.midtermScore IS NOT NULL")
    Double getAverageMidtermScore();

    @Query("SELECT AVG(c.finalScore) FROM CourseResult c WHERE c.finalScore IS NOT NULL")
    Double getAverageFinalScore();

    @Query("SELECT c.finalGrade, COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL GROUP BY c.finalGrade")
    List<Object[]> getGradeDistribution();

    @Query("SELECT COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL")
    long countTotalGraded();

    @Query("SELECT COUNT(c) FROM CourseResult c WHERE c.finalGrade IS NOT NULL AND UPPER(c.finalGrade) <> 'F'")
    long countPass();
}
