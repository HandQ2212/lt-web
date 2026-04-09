package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AttendanceRequest {
    @NotNull
    private UUID classId;
    @NotNull
    private UUID studentId;
    @NotNull
    private AttendanceStatus status;
    private String notes;
}
