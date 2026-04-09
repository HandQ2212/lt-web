package com.elc.system.modules.lms.entity;

import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "submissions")
@Getter
@Setter
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(name = "submission_date")
    private ZonedDateTime submissionDate = ZonedDateTime.now();

    @Column(name = "file_url")
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String content;

    private BigDecimal grade;

    private String feedback;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt = ZonedDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
