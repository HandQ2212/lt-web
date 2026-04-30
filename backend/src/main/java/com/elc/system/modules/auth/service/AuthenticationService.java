package com.elc.system.modules.auth.service;

import com.elc.system.core.security.JwtUtils;
import com.elc.system.modules.auth.dto.AuthDto.*;
import com.elc.system.modules.auth.dto.PasswordResetDto.*;
import com.elc.system.modules.auth.entity.PasswordResetToken;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.exception.InvalidCredentialsException;
import com.elc.system.modules.auth.exception.InvalidTokenException;
import com.elc.system.modules.auth.exception.UserAlreadyExistsException;
import com.elc.system.modules.auth.repository.PasswordResetTokenRepository;
import com.elc.system.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .role(UserRole.LEAD)  // Security: Always LEAD for self-registration, Manager can change later
                .status(UserStatus.ACTIVE)
                .branchId(request.getBranchId())
                .build();

        String accessToken = jwtUtils.generateToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);

        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException());

        String accessToken = jwtUtils.generateToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(mapToUserResponse(user))
                .build();
    }

    @Transactional
    public void logout(LogoutRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        user.setRefreshToken(null);
        userRepository.save(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

        if (jwtUtils.isTokenExpired(request.getRefreshToken())) {
            throw new InvalidTokenException("Refresh token expired");
        }

        String username = jwtUtils.extractUsername(request.getRefreshToken());
        if (!username.equals(user.getEmail())) {
            throw new InvalidTokenException("Invalid refresh token");
        }

        String newAccessToken = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .user(mapToUserResponse(user))
                .build();
    }

    public void forgotPassword(String email) {
        // Always return 200 OK to prevent email enumeration
        userRepository.findByEmail(email).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();

            PasswordResetToken token = PasswordResetToken.builder()
                    .userId(user.getId())
                    .token(resetToken)
                    .expiresAt(ZonedDateTime.now().plusMinutes(15))
                    .build();

            passwordResetTokenRepository.save(token);

            // MOCK EMAIL DELIVERY - Log to console
            log.info("==============================================");
            log.info("PASSWORD RESET TOKEN for {}: {}", email, resetToken);
            log.info("Reset link: http://localhost:8080/api/auth/reset-password?token={}", resetToken);
            log.info("Token expires at: {}", token.getExpiresAt());
            log.info("==============================================");
            // TODO: Integrate email service in future milestone
        });
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid reset token"));

        if (resetToken.isExpired()) {
            throw new InvalidTokenException("Reset token has expired");
        }

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Reset token has already been used");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new InvalidTokenException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsedAt(ZonedDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }
}
