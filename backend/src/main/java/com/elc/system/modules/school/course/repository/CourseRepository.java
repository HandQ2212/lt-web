package com.elc.system.modules.school.course.repository;

import com.elc.system.modules.school.course.entity.Course;
import com.elc.system.modules.school.course.entity.CourseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

    @Query("""
            SELECT c
            FROM Course c
            WHERE (:status IS NULL OR c.status = :status)
              AND (:levelId IS NULL OR c.level.id = :levelId)
              AND (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Course> search(
            @Param("status") CourseStatus status,
            @Param("levelId") UUID levelId,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    boolean existsByLevelId(UUID levelId);
}
