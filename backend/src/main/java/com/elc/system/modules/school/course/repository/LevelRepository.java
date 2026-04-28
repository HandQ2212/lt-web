package com.elc.system.modules.school.course.repository;

import com.elc.system.modules.school.course.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {

    boolean existsByCodeIgnoreCase(String code);

    Optional<Level> findByCodeIgnoreCase(String code);
}
