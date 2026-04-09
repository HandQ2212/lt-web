package com.elc.system.modules.sms.dto;

import com.elc.system.modules.sms.entity.CourseLevel;
import com.elc.system.modules.sms.entity.CourseStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CourseResponse {
    private UUID id;
    private String name;
    private String description;
    private CourseLevel level;
    private Integer durationWeeks;
    private BigDecimal basePrice;
    private Integer maxStudents;
    private CourseStatus status;
}
