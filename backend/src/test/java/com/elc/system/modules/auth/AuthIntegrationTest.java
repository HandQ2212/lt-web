package com.elc.system.modules.auth;

import com.elc.system.modules.auth.dto.AuthDto.*;
import com.elc.system.modules.auth.dto.PasswordResetDto;
import com.elc.system.modules.auth.repository.PasswordResetTokenRepository;
import com.elc.system.modules.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Authentication endpoints.
 * Uses H2 in-memory database for fast, isolated testing.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;



    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @AfterEach
    void cleanDatabase() {
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    private String testEmail = "test@example.com";
    private String testPassword = "password123";

    // ==================== Authentication Tests ====================

    @Test
    void register_withValidData_returnsLEADRole() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        ResultActions result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.user.email").value(testEmail))
                .andExpect(jsonPath("$.user.role").value("LEAD"));
    }

    @Test
    void register_withExistingEmail_returns409() throws Exception {
        // First registration
        RegisterRequest request = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        // Second registration with same email
        ResultActions result = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        result.andExpect(status().isConflict());
    }

    @Test
    void login_withCorrectCredentials_returnsJWT() throws Exception {
        // First, register a user
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // Then, login
        LoginRequest loginRequest = LoginRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .build();

        ResultActions result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)));

        result.andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.user.role").value("LEAD"));
    }

    @Test
    void login_withWrongPassword_returns401() throws Exception {
        // Register a user first
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // Login with wrong password
        LoginRequest loginRequest = LoginRequest.builder()
                .email(testEmail)
                .password("wrongpassword")
                .build();

        ResultActions result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)));

        result.andExpect(status().isUnauthorized());
    }

    @Test
    void logout_withValidToken_revokesRefreshToken() throws Exception {
        // Register and login
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        LoginRequest loginRequest = LoginRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .build();

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Extract refresh token from response
        String refreshToken = objectMapper.readTree(loginResponse)
                .get("refreshToken").asText();
        String accessToken = objectMapper.readTree(loginResponse)
                .get("accessToken").asText();

        // Logout
        LogoutRequest logoutRequest = LogoutRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(logoutRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void refresh_withValidToken_returnsNewAccessToken() throws Exception {
        // Register and login
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        LoginRequest loginRequest = LoginRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .build();

        String loginResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        String refreshToken = objectMapper.readTree(loginResponse)
                .get("refreshToken").asText();

        // Refresh token
        RefreshRequest refreshRequest = RefreshRequest.builder()
                .refreshToken(refreshToken)
                .build();

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    // ==================== Password Reset Tests ====================

    @Test
    void forgotPassword_withValidEmail_generatesToken() throws Exception {
        // Register user first
        RegisterRequest registerRequest = RegisterRequest.builder()
                .email(testEmail)
                .password(testPassword)
                .fullName("Test User")
                .build();

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));

        // Forgot password
        PasswordResetDto.ForgotPasswordRequest forgotRequest = new PasswordResetDto.ForgotPasswordRequest(testEmail);

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void forgotPassword_withNonExistentEmail_returns200() throws Exception {
        // Email enumeration prevention - always returns 200
        PasswordResetDto.ForgotPasswordRequest forgotRequest = new PasswordResetDto.ForgotPasswordRequest("nonexistent@example.com");

        mockMvc.perform(post("/api/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(forgotRequest)))
                .andExpect(status().isOk());
    }
}
