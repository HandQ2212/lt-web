package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    @EntityGraph(attributePaths = {"levels"})
    List<Course> findAll();

    @EntityGraph(attributePaths = {"levels"})
    Optional<Course> findWithLevelsById(UUID id);
}
