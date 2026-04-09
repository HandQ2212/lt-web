package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.AssignmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class AssignmentRequest {
    @NotNull
    private UUID classId;
    @NotBlank
    private String title;
    private String description;
    @NotNull
    private ZonedDateTime dueDate;
    @NotNull
    private AssignmentType type;
}
