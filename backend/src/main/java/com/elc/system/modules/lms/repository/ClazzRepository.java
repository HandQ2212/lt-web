package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Clazz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClazzRepository extends JpaRepository<Clazz, UUID> {
    List<Clazz> findByBranchId(UUID branchId);
    List<Clazz> findByTeacherId(UUID teacherId);
    List<Clazz> findByCourseId(UUID courseId);
}
