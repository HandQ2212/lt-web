package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.Course;
import com.elc.system.modules.sms.entity.CourseLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByLevel(CourseLevel level);
}
