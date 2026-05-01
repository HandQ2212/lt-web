package com.elc.system.modules.notification.repository;

import com.elc.system.modules.notification.entity.Notification;
import com.elc.system.modules.notification.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    void markAllAsRead(@Param("userId") UUID userId);

    // For Phase 03 (Announcement)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(
        @Param("userId") UUID userId,
        @Param("type") NotificationType type,
        Pageable pageable
    );
}
