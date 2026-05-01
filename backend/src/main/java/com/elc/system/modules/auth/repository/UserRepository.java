package com.elc.system.modules.auth.repository;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for User entity.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByRefreshToken(String refreshToken);
    boolean existsByEmail(String email);

    // For Announcement system
    List<User> findByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = 'ACTIVE'")
    List<User> findActiveByRole(@Param("role") UserRole role);

    // For Admin User Management - Pagination support with optional role filter
    @Query("SELECT u FROM User u WHERE (:role IS NULL OR u.role = :role)")
    Page<User> findByRoleOptional(@Param("role") UserRole role, Pageable pageable);
}
