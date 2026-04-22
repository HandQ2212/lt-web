package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

/**
 * Entity representing the final results of a student in a course.
 * Mapped to public.course_results table.
 */
@Entity
@Table(name = "course_results", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class CourseResult extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "midterm_score")
    private BigDecimal midtermScore;

    @Column(name = "final_score")
    private BigDecimal finalScore;

    @Column(name = "other_scores", columnDefinition = "JSONB")
    private String otherScores;

    @Column(name = "final_grade")
    private String finalGrade;

    @Column(columnDefinition = "TEXT")
    private String comments;
}
