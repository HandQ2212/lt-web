package com.elc.system.modules.chatbot.controller;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageRequest;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageResponse;
import com.elc.system.modules.chatbot.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @Valid @RequestBody ChatMessageRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(chatbotService.reply(request, currentUser));
    }
}
