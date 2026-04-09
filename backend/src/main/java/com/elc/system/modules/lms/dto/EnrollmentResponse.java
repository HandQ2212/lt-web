package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.EnrollmentStatus;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class EnrollmentResponse {
    private UUID id;
    private String studentName;
    private String className;
    private ZonedDateTime enrollmentDate;
    private EnrollmentStatus status;
    private String notes;
}
