package com.elc.system.modules.lead.repository;

import com.elc.system.modules.lead.entity.LeadInterest;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadInterestRepository extends JpaRepository<LeadInterest, UUID> {

    @EntityGraph(attributePaths = {"course", "clazz", "clazz.level"})
    List<LeadInterest> findByLeadIdOrderByCreatedAtDesc(UUID leadId);

    Optional<LeadInterest> findByLeadIdAndCourseId(UUID leadId, UUID courseId);

    Optional<LeadInterest> findByLeadIdAndClazzId(UUID leadId, UUID clazzId);
}
