package com.elc.system.modules.notification.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.announcement.entity.Announcement;
import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity representing a notification for a user.
 * Mapped to public.notifications table.
 */
@Entity
@Table(name = "notifications", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id")
    private Announcement announcement;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    private boolean read = false;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.PERSONAL;
}
