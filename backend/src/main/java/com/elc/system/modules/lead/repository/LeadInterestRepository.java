package com.elc.system.modules.lead.repository;

import com.elc.system.modules.lead.entity.LeadInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LeadInterestRepository extends JpaRepository<LeadInterest, UUID> {
    List<LeadInterest> findByLeadId(UUID leadId);

    boolean existsByLeadIdAndCourseId(UUID leadId, UUID courseId);
}
