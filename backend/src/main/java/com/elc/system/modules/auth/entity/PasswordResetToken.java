package com.elc.system.modules.auth.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Entity representing password reset tokens.
 * Tokens expire after 15 minutes and are single-use.
 */
@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(unique = true, nullable = false)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private ZonedDateTime expiresAt;

    @Column(name = "used_at")
    private ZonedDateTime usedAt;

    /**
     * Check if token is expired
     */
    public boolean isExpired() {
        return ZonedDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if token has been used
     */
    public boolean isUsed() {
        return usedAt != null;
    }
}
