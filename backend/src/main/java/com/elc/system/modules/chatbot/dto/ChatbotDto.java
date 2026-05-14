package com.elc.system.modules.chatbot.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

public class ChatbotDto {

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatMessageRequest {
        @NotBlank(message = "Message is required")
        @Size(max = 1200, message = "Message must be at most 1200 characters")
        private String message;

        @Valid
        @Size(max = 12, message = "History must contain at most 12 messages")
        private List<ChatHistoryMessage> history;

        @Size(max = 200, message = "Current path must be at most 200 characters")
        private String currentPath;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatHistoryMessage {
        @NotBlank(message = "Role is required")
        private String role;

        @NotBlank(message = "Content is required")
        @Size(max = 1200, message = "Content must be at most 1200 characters")
        private String content;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ChatMessageResponse {
        private String message;
        private String source;
        private ZonedDateTime timestamp;
    }
}
