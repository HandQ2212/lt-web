package com.elc.system.modules.lead.repository;

import com.elc.system.modules.lead.entity.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<Lead, UUID>, JpaSpecificationExecutor<Lead> {
    Optional<Lead> findByUserId(UUID userId);

    Optional<Lead> findByEmailIgnoreCase(String email);

    Optional<Lead> findByPhone(String phone);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);
}
