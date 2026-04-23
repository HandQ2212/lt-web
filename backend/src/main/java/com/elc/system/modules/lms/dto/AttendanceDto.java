package com.elc.system.modules.lms.dto;

import com.elc.system.modules.lms.entity.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class AttendanceDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceRequest {
        private UUID enrollmentId;
        private LocalDate attendanceDate;
        private AttendanceStatus status;
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
        private AttendanceStatus status;
        private String notes;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AttendanceReportResponse {
        private UUID studentId;
        private String studentName;
        private UUID classId;
        private String className;
        private Integer year;
        private Integer month;
        private Long totalSessions;
        private Long presentCount;
        private Long absentCount;
        private Long excusedCount;
        private Long lateCount;
        private Double attendanceRate;
        private List<DailyAttendanceRecord> dailyRecords;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyAttendanceRecord {
        private LocalDate date;
        private AttendanceStatus status;
        private String notes;
    }
}
