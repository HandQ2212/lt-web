package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "courses")
@Getter
@Setter
public class Course extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    private CourseLevel level;

    @PositiveOrZero
    @Column(name = "duration_weeks", nullable = false)
    private Integer durationWeeks = 12;

    @PositiveOrZero
    @Column(name = "base_price", nullable = false)
    private BigDecimal basePrice = BigDecimal.ZERO;

    @PositiveOrZero
    @Column(name = "max_students")
    private Integer maxStudents = 25;

    @Column(name = "curriculum_url")
    private String curriculumUrl;

    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.ACTIVE;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
