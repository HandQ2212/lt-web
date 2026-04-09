package com.elc.system.modules.notification.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "announcements")
@Getter
@Setter
public class Announcement extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_role")
    private UserRole targetRole;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
