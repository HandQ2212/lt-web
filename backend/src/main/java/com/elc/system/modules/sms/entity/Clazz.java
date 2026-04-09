package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "classes")
@Getter
@Setter
public class Clazz extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(nullable = false)
    private String name;

    @Column(name = "max_students", nullable = false)
    private Integer maxStudents;

    @Column(name = "current_students")
    private Integer currentStudents = 0;

    @Enumerated(EnumType.STRING)
    private ClassStatus status = ClassStatus.ACCEPTING;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "meeting_url")
    private String meetingUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
