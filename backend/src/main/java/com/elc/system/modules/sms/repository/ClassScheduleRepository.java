package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, UUID> {
    List<ClassSchedule> findByClazzId(UUID classId);
}
