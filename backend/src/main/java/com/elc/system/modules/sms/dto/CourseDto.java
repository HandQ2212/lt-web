package com.elc.system.modules.sms.dto;

import com.elc.system.modules.sms.entity.CourseLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

public class CourseDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseRequest {
        private String name;
        private String description;
        private CourseLevel level;
        private BigDecimal basePrice;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CourseResponse {
        private UUID id;
        private String name;
        private String description;
        private CourseLevel level;
        private BigDecimal basePrice;
    }
}
