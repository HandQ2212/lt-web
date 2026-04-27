package com.elc.system.modules.lead.repository;

import com.elc.system.modules.lead.entity.Lead;
import com.elc.system.modules.lead.entity.LeadSource;
import com.elc.system.modules.lead.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {

    @Query("""
            SELECT l
            FROM Lead l
            WHERE (:status IS NULL OR l.status = :status)
              AND (:source IS NULL OR l.source = :source)
              AND (:fromDate IS NULL OR l.createdAt >= :fromDate)
              AND (:toDate IS NULL OR l.createdAt <= :toDate)
            ORDER BY l.createdAt DESC
            """)
    Page<Lead> searchLeads(
            @Param("status") LeadStatus status,
            @Param("source") LeadSource source,
            @Param("fromDate") ZonedDateTime fromDate,
            @Param("toDate") ZonedDateTime toDate,
            Pageable pageable
    );
}
