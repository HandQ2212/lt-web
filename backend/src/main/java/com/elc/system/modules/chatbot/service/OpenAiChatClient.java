package com.elc.system.modules.chatbot.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OpenAiChatClient {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    @Value("${openai.api-key:}")
    private String apiKey;

    @Value("${openai.model:gpt-5-mini}")
    private String model;

    @Value("${openai.responses-url:https://api.openai.com/v1/responses}")
    private String responsesUrl;

    @Value("${openai.timeout-seconds:20}")
    private int timeoutSeconds;

    @Value("${openai.max-output-tokens:2000}")
    private int maxOutputTokens;

    @Value("${openai.reasoning-effort:low}")
    private String reasoningEffort;

    public boolean isConfigured() {
        return !normalizedApiKey().isBlank();
    }

    public Optional<String> createReply(String instructions, String input) {
        if (!isConfigured()) {
            return Optional.empty();
        }

        try {
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("model", model);
            payload.put("instructions", instructions);
            payload.put("input", input);
            payload.put("store", false);
            payload.put("max_output_tokens", Math.max(maxOutputTokens, 1));
            if (supportsReasoningEffort()) {
                ObjectNode reasoning = objectMapper.createObjectNode();
                reasoning.put("effort", reasoningEffort.trim());
                payload.set("reasoning", reasoning);
            }

            HttpRequest request = HttpRequest.newBuilder(URI.create(responsesUrl))
                    .timeout(Duration.ofSeconds(Math.max(timeoutSeconds, 1)))
                    .header("Authorization", "Bearer " + normalizedApiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("OpenAI request failed with status "
                        + response.statusCode() + ": " + compact(response.body(), 400));
            }

            Optional<String> answer = extractText(response.body());
            if (answer.isEmpty()) {
                throw new IllegalStateException("OpenAI response did not include output_text: "
                        + compact(response.body(), 700));
            }
            return answer;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("OpenAI request interrupted", ex);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("OpenAI request failed", ex);
        }
    }

    private boolean supportsReasoningEffort() {
        if (model == null || reasoningEffort == null || reasoningEffort.isBlank()) {
            return false;
        }
        String normalizedModel = model.toLowerCase(Locale.ROOT).trim();
        return normalizedModel.startsWith("gpt-5") || normalizedModel.startsWith("o");
    }

    private String normalizedApiKey() {
        if (apiKey == null) {
            return "";
        }
        String value = apiKey.trim();
        if (value.length() >= 2
                && ((value.startsWith("\"") && value.endsWith("\""))
                || (value.startsWith("'") && value.endsWith("'")))) {
            return value.substring(1, value.length() - 1).trim();
        }
        return value;
    }

    private Optional<String> extractText(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        StringBuilder text = new StringBuilder();

        JsonNode outputText = root.path("output_text");
        if (outputText.isTextual() && !outputText.asText().isBlank()) {
            return Optional.of(outputText.asText().trim());
        }

        for (JsonNode item : root.path("output")) {
            for (JsonNode content : item.path("content")) {
                if ("output_text".equals(content.path("type").asText())) {
                    text.append(content.path("text").asText());
                }
            }
        }

        String result = text.toString().trim();
        return result.isBlank() ? Optional.empty() : Optional.of(result);
    }

    private String compact(String value, int maxLength) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        return normalized.length() <= maxLength ? normalized : normalized.substring(0, maxLength - 3) + "...";
    }
}
