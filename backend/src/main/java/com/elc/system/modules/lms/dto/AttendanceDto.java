package com.elc.system.modules.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

public class AttendanceDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceRequest {
        private UUID enrollmentId;
        private LocalDate attendanceDate;
        private boolean present;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceResponse {
        private UUID id;
        private UUID enrollmentId;
        private String studentName;
        private LocalDate attendanceDate;
        private boolean present;
        private String notes;
    }
}
