package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.ZonedDateTime;

@Entity
@Table(name = "submissions")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Submission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    private ZonedDateTime submissionDate;

    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Double grade;

    private String feedback;

    @Builder.Default
    private String status = "SUBMITTED"; // SUBMITTED, GRADED, LATE
}
