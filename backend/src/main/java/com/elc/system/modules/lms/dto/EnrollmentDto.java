package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

public class EnrollmentDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EnrollmentRequest {
        private UUID studentId;
        private UUID classId;
        private LocalDate enrollmentDate;
        private EnrollmentStatus status;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransferClassRequest {
        @NotNull(message = "Target class is required")
        private UUID targetClassId;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EnrollmentResponse {
        private UUID id;
        private UUID studentId;
        private String studentName;
        private UUID classId;
        private String className;
        private LocalDate enrollmentDate;
        private EnrollmentStatus status;
    }
}
