package com.elc.system.modules.chatbot.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageRequest;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageResponse;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatTaskAcceptedResponse;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatTaskStatus;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatTaskStatusResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotTaskService {

    private static final long POLL_AFTER_MS = 3000L;
    private static final Duration TASK_TTL = Duration.ofMinutes(10);

    private final ChatbotTaskProcessor chatbotTaskProcessor;
    private final Map<String, ChatTaskState> tasks = new ConcurrentHashMap<>();

    public ChatTaskAcceptedResponse submit(ChatMessageRequest request, User currentUser) {
        cleanupExpiredTasks();

        String taskId = UUID.randomUUID().toString();
        ZonedDateTime submittedAt = ZonedDateTime.now();

        tasks.put(taskId, ChatTaskState.builder()
                .taskId(taskId)
                .status(ChatTaskStatus.PENDING)
                .submittedAt(submittedAt)
                .expiresAt(submittedAt.plus(TASK_TTL))
                .build());

        ChatTaskState state = tasks.get(taskId);
        if (state != null) {
            state.setStatus(ChatTaskStatus.RUNNING);
        }

        chatbotTaskProcessor.process(request, currentUser)
                .thenAccept(response -> completeTask(taskId, response))
                .exceptionally(ex -> {
                    failTask(taskId, ex);
                    return null;
                });

        return ChatTaskAcceptedResponse.builder()
                .taskId(taskId)
                .status(ChatTaskStatus.PENDING)
                .pollAfterMs(POLL_AFTER_MS)
                .submittedAt(submittedAt)
                .build();
    }

    public ChatTaskStatusResponse getStatus(String taskId) {
        cleanupExpiredTasks();

        ChatTaskState state = tasks.get(taskId);
        if (state == null) {
            throw new IllegalArgumentException("Task not found or expired");
        }

        return ChatTaskStatusResponse.builder()
                .taskId(state.getTaskId())
                .status(state.getStatus())
                .message(state.getMessage())
                .source(state.getSource())
                .error(state.getError())
                .submittedAt(state.getSubmittedAt())
                .completedAt(state.getCompletedAt())
                .timestamp(state.getTimestamp())
                .build();
    }

    private void completeTask(String taskId, ChatMessageResponse response) {
        ChatTaskState state = tasks.get(taskId);
        if (state == null) {
            return;
        }
        state.setStatus(ChatTaskStatus.SUCCESS);
        state.setMessage(response.getMessage());
        state.setSource(response.getSource());
        state.setTimestamp(response.getTimestamp());
        state.setCompletedAt(ZonedDateTime.now());
    }

    private void failTask(String taskId, Throwable ex) {
        ChatTaskState state = tasks.get(taskId);
        if (state == null) {
            return;
        }
        log.warn("Chatbot async task {} failed: {}", taskId, ex.getMessage(), ex);
        state.setStatus(ChatTaskStatus.FAILED);
        state.setError("Khong the xu ly yeu cau luc nay. Vui long thu lai sau it phut.");
        state.setCompletedAt(ZonedDateTime.now());
    }

    private void cleanupExpiredTasks() {
        ZonedDateTime now = ZonedDateTime.now();
        tasks.entrySet().removeIf(entry -> entry.getValue().getExpiresAt().isBefore(now));
    }

    @lombok.Data
    @lombok.Builder
    private static class ChatTaskState {
        private String taskId;
        private ChatTaskStatus status;
        private String message;
        private String source;
        private String error;
        private ZonedDateTime submittedAt;
        private ZonedDateTime completedAt;
        private ZonedDateTime timestamp;
        private ZonedDateTime expiresAt;
    }
}
