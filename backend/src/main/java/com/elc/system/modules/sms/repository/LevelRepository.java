package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {
    List<Level> findByCourseId(UUID courseId);

    boolean existsByCourseIdAndCodeIgnoreCase(UUID courseId, String code);

    boolean existsByCourseIdAndCodeIgnoreCaseAndIdNot(UUID courseId, String code, UUID id);
}
