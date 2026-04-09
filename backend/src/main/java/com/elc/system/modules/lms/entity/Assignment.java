package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.sms.entity.Clazz;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignments")
@Getter
@Setter
public class Assignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Clazz clazz;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "due_date", nullable = false)
    private ZonedDateTime dueDate;

    @Enumerated(EnumType.STRING)
    private AssignmentType type = AssignmentType.FILE_SUBMISSION;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String attachments = "[]";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
