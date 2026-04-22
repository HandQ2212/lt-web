package com.elc.system.modules.crm.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.sms.entity.CourseLevel;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * Entity representing a potential customer (Lead).
 * Mapped to public.leads table.
 */
@Entity
@Table(name = "leads", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Lead extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(unique = true)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_level")
    private CourseLevel preferredLevel;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private LeadStatus status = LeadStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "source")
    private LeadSource source = LeadSource.WEBSITE_FORM;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
