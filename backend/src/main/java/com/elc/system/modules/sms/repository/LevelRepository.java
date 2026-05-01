package com.elc.system.modules.sms.repository;

import com.elc.system.modules.sms.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {
    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);
}
