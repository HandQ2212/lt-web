package com.elc.system.modules.crm.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.sms.entity.Branch;
import com.elc.system.modules.sms.entity.CourseLevel;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "leads")
@Getter
@Setter
public class Lead extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_level")
    private CourseLevel preferredLevel;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Enumerated(EnumType.STRING)
    private LeadStatus status = LeadStatus.NEW;

    @Enumerated(EnumType.STRING)
    private LeadSource source = LeadSource.WEBSITE_FORM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private String notes;
}
