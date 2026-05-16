package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Clazz;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClazzRepository extends JpaRepository<Clazz, UUID> {
    @EntityGraph(attributePaths = {"level", "level.course", "room", "teacher", "branch"})
    List<Clazz> findAll();

    @EntityGraph(attributePaths = {"level", "level.course", "room", "teacher", "branch"})
    Optional<Clazz> findWithRelationsById(UUID id);

    List<Clazz> findByBranchId(UUID branchId);
    List<Clazz> findByTeacherId(UUID teacherId);
    List<Clazz> findByLevelId(UUID levelId);
    List<Clazz> findByLevelCourseId(UUID courseId);
    boolean existsByIdAndTeacherId(UUID id, UUID teacherId);
    boolean existsByLevelId(UUID levelId);
    long countByBranchIdAndStatus(UUID branchId, com.elc.system.modules.lms.entity.ClassStatus status);
}
