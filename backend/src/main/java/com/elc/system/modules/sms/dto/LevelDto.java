package com.elc.system.modules.sms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

public class LevelDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LevelRequest {
        @NotBlank(message = "Code is required")
        private String code;

        @NotBlank(message = "Name is required")
        private String name;

        private String description;
        private Integer displayOrder;
        private Boolean isActive;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LevelResponse {
        private UUID id;
        private String code;
        private String name;
        private String description;
        private Integer displayOrder;
        private Boolean isActive;
    }
}
