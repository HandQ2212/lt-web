package com.elc.system.modules.consultation.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consultation extends BaseEntity {

    @Column(name = "lead_id", nullable = false)
    private UUID leadId;

    @Column(name = "consultant_id", nullable = false)
    private UUID consultantId;

    @Column(name = "consultation_date", nullable = false)
    private ZonedDateTime consultationDate;

    @Column(name = "notes")
    private String notes;

    @Column(name = "next_step")
    private String nextStep;

    @Column(name = "next_reminder_at")
    private ZonedDateTime nextReminderAt;

    @Column(name = "reminder_sent_at")
    private ZonedDateTime reminderSentAt;

    @Column(name = "reminder_note")
    private String reminderNote;
}
