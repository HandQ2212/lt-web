package com.elc.system.modules.crm.repository;

import com.elc.system.modules.crm.entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, UUID> {
    Page<Consultation> findByLeadId(UUID leadId, Pageable pageable);
    Page<Consultation> findByConsultantId(UUID consultantId, Pageable pageable);
}
