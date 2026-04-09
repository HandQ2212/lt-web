package com.elc.system.modules.sms.dto;

import com.elc.system.modules.sms.entity.ClassStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ClassResponse {
    private UUID id;
    private String name;
    private String courseName;
    private String teacherName;
    private String roomName;
    private Integer maxStudents;
    private Integer currentStudents;
    private ClassStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
}
