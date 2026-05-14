package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.sms.dto.ClassScheduleDto.ScheduleResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class ClassDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ClassRequest {
        private UUID levelId;
        private UUID roomId;
        private UUID teacherId;
        private UUID branchId;
        private String name;
        private ClassStatus status;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer maxStudents;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ClassResponse {
        private UUID id;
        private String name;
        private UUID levelId;
        private String levelName;
        private UUID courseId;
        private String courseName;
        private UUID roomId;
        private String roomName;
        private UUID teacherId;
        private String teacherName;
        private UUID branchId;
        private String branchName;
        private ClassStatus status;
        private LocalDate startDate;
        private LocalDate endDate;
        private Integer maxStudents;
        private Integer currentStudents;
        private List<ScheduleResponse> schedules;
    }
}
