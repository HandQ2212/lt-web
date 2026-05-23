package com.elc.system.modules.chatbot.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageRequest;
import com.elc.system.modules.chatbot.dto.ChatbotDto.ChatMessageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ChatbotTaskProcessor {

    private final ChatbotService chatbotService;

    @Async("chatbotTaskExecutor")
    public CompletableFuture<ChatMessageResponse> process(ChatMessageRequest request, User currentUser) {
        return CompletableFuture.completedFuture(chatbotService.reply(request, currentUser));
    }
}
