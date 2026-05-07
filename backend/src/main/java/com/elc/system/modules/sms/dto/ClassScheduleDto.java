package com.elc.system.modules.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.elc.system.modules.sms.validation.ValidScheduleTime;
import java.time.LocalTime;
import java.util.UUID;

public class ClassScheduleDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    @ValidScheduleTime(message = "Start time must be before end time")
    public static class ScheduleRequest {
        @NotNull(message = "Day of week is required")
        private String dayOfWeek;

        @NotNull(message = "Start time is required")
        private LocalTime startTime;

        @NotNull(message = "End time is required")
        private LocalTime endTime;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ScheduleResponse {
        private UUID id;
        private UUID classId;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConflictCheckRequest {
        private UUID teacherId;
        private UUID roomId;
        private String dayOfWeek;
        private LocalTime startTime;
        private LocalTime endTime;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ConflictCheckResponse {
        private boolean hasConflict;
        private String conflictMessage;
    }
}
