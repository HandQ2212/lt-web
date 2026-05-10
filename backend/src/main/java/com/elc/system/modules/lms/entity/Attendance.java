package com.elc.system.modules.lms.entity;

import com.elc.system.core.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Entity representing an attendance record for a student in a class on a specific date.
 * Mapped to public.attendance table.
 */
@Entity
@Table(name = "attendance", schema = "public", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"enrollment_id", "session_date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @Column(name = "session_date")
    private LocalDate attendanceDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PRESENT;

    @Column(name = "present", nullable = false)
    private Boolean present = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    @PreUpdate
    public void updatePresent() {
        this.present = (status == AttendanceStatus.PRESENT || status == AttendanceStatus.LATE);
    }
}
