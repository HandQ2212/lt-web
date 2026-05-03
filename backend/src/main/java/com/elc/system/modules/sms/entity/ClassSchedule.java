package com.elc.system.modules.sms.entity;

import com.elc.system.core.BaseEntity;
import com.elc.system.modules.lms.entity.Clazz;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalTime;

@Entity
@Table(name = "class_schedules")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Clazz clazz;

    @Column(nullable = false)
    private String dayOfWeek; // MON, TUE, WED, THU, FRI, SAT, SUN

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;
}
