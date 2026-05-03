package com.elc.system.modules.consultation.repository;

import com.elc.system.modules.consultation.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {

    List<Consultation> findByLeadIdOrderByConsultationDateDesc(UUID leadId);

    List<Consultation> findByConsultantIdAndNextReminderAtBetweenOrderByNextReminderAtAsc(
            UUID consultantId, ZonedDateTime start, ZonedDateTime end);

    @Query("""
            SELECT c
            FROM Consultation c
            WHERE (:leadId IS NULL OR c.leadId = :leadId)
              AND (:consultantId IS NULL OR c.consultantId = :consultantId)
              AND (:fromDate IS NULL OR c.consultationDate >= :fromDate)
              AND (:toDate IS NULL OR c.consultationDate <= :toDate)
            ORDER BY c.consultationDate DESC
            """)
    Page<Consultation> searchConsultations(
            @Param("leadId") UUID leadId,
            @Param("consultantId") UUID consultantId,
            @Param("fromDate") ZonedDateTime fromDate,
            @Param("toDate") ZonedDateTime toDate,
            Pageable pageable
    );
}
