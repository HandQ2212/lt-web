package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.sms.entity.Clazz;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "class_id"})
})
@Getter
@Setter
public class Enrollment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Clazz clazz;

    @Column(name = "enrollment_date")
    private ZonedDateTime enrollmentDate = ZonedDateTime.now();

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status = EnrollmentStatus.PENDING;

    private String notes;
}
