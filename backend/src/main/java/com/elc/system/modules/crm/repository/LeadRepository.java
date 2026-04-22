package com.elc.system.modules.crm.repository;

import com.elc.system.modules.crm.entity.Lead;
import com.elc.system.modules.crm.entity.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID> {
    Page<Lead> findByStatus(LeadStatus status, Pageable pageable);
    Page<Lead> findByFullNameContainingIgnoreCase(String name, Pageable pageable);
}
