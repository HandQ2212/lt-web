package com.elc.system.modules.lead.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "leads", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lead extends BaseEntity {

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;
 
    @Column(name = "date_of_birth")
    private java.time.LocalDate dateOfBirth;
 
    @Column(name = "gender")
    private String gender;
 
    @Column(name = "address")
    private String address;
 
    @Column(name = "preferred_level")
    private String preferredLevel;

    @Column(name = "assessment_score")
    private Integer assessmentScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LeadStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private LeadSource source;

    @Column(name = "branch_id")
    private UUID branchId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "notes")
    private String notes;
}
