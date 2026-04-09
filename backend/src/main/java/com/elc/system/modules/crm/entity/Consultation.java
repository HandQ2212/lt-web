package com.elc.system.modules.crm.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "consultations")
@Getter
@Setter
public class Consultation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id")
    private Lead lead;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultant_id")
    private User consultant;

    @Column(name = "consultation_date")
    private ZonedDateTime consultationDate = ZonedDateTime.now();

    private String notes;

    @Column(name = "next_step")
    private String nextStep;
}
