package com.elc.system.modules.lms.repository;

import com.elc.system.modules.lms.entity.Submission;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
    @EntityGraph(attributePaths = {"assignment", "student"})
    List<Submission> findByAssignmentId(UUID assignmentId);

    @EntityGraph(attributePaths = {"assignment", "student"})
    List<Submission> findByStudentId(UUID studentId);
}
