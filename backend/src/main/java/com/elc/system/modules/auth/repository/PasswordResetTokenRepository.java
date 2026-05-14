package com.elc.system.modules.auth.repository;

import com.elc.system.modules.auth.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for PasswordResetToken entity.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByToken(String token);

    Optional<PasswordResetToken> findByUserId(UUID userId);

    void deleteByExpiresAtBefore(ZonedDateTime date);

    void deleteByUsedAtIsNotNull();
}
