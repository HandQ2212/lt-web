package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.sms.entity.Clazz;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_id", "student_id", "session_date"})
})
@Getter
@Setter
public class Attendance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Clazz clazz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    private String notes;
}
