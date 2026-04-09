package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.SubmissionStatus;
import lombok.Data;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class SubmissionResponse {
    private UUID id;
    private UUID assignmentId;
    private String studentName;
    private String fileUrl;
    private ZonedDateTime submittedAt;
    private Integer grade;
    private String feedback;
    private SubmissionStatus status;
}
