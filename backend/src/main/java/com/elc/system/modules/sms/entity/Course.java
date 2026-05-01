package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * Entity representing a course offered by the school.
 * Mapped to public.courses table.
 */
@Entity
@Table(name = "courses", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private CourseLevel level;

    @Column(name = "base_price")
    private BigDecimal basePrice;
}
