package com.elc.system.modules.auth.service;

import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.dto.ProfileDto.ChangePasswordRequest;
import com.elc.system.modules.auth.dto.ProfileDto.ProfileUpdateRequest;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.exception.InvalidCredentialsException;
import com.elc.system.modules.auth.exception.UserNotFoundException;
import com.elc.system.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Profile Service
 * Handles user profile operations for authenticated users
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    public UserResponse getCurrentUserResponse() {
        return mapToUserResponse(getCurrentUser());
    }

    @Transactional
    public UserResponse updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentUser();

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.setAvatarUrl(request.getAvatarUrl());

        userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        return mapToUserResponse(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();

        // Verify old password
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        // Encode and save new password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
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
