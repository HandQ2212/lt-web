package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.Level;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {
    @EntityGraph(attributePaths = {"course"})
    List<Level> findAll(Sort sort);

    @EntityGraph(attributePaths = {"course"})
    Optional<Level> findWithCourseById(UUID id);

    List<Level> findByCourseId(UUID courseId);

    boolean existsByCourseIdAndCodeIgnoreCase(UUID courseId, String code);

    boolean existsByCourseIdAndCodeIgnoreCaseAndIdNot(UUID courseId, String code, UUID id);
}
