package com.elc.system.modules.chatbot.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageRequest;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatTaskAcceptedResponse;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatTaskStatusResponse;
import com.elc.system.modules.chatbot.service.ChatbotTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotTaskService chatbotTaskService;

    @PostMapping("/messages")
    public ResponseEntity<ChatTaskAcceptedResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.accepted().body(chatbotTaskService.submit(request, currentUser));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<ChatTaskStatusResponse> getTaskStatus(@PathVariable String taskId) {
        return ResponseEntity.ok(chatbotTaskService.getStatus(taskId));
    }
}
