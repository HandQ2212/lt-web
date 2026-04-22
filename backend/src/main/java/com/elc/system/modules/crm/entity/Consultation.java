package com.elc.system.modules.crm.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.ZonedDateTime;

/**
 * Entity representing a consultation session with a Lead.
 * Mapped to public.consultations table.
 */
@Entity
@Table(name = "consultations", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Consultation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private User consultant;

    @Column(name = "consultation_date")
    private ZonedDateTime consultationDate = ZonedDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;
}
