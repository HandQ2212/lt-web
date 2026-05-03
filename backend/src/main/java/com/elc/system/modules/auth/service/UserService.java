package com.elc.system.modules.auth.service;

import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.dto.UserDto.CreateUserRequest;
import com.elc.system.modules.auth.dto.UserDto.UpdateUserRequest;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.exception.UserAlreadyExistsException;
import com.elc.system.modules.auth.exception.UserNotFoundException;
import com.elc.system.modules.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    /**
     * Get current authenticated user from security context
     * Utility method used by other services
     */
    public User getCurrentUser() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    // ==================== ADMIN USER MANAGEMENT METHODS ====================

    /**
     * Get all users with pagination and optional role filter
     */
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        log.info("Fetching all users with pagination");
        return userRepository.findAll(pageable)
                .map(this::mapToUserResponse);
    }

    /**
     * Get user by ID
     */
    public UserResponse getUserById(UUID userId) {
        log.info("Fetching user by ID: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return mapToUserResponse(user);
    }

    /**
     * Create new user account (admin function)
     */
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .role(request.getRole() != null ? request.getRole() : com.elc.system.modules.auth.entity.UserRole.STUDENT)
                .status(UserStatus.ACTIVE)
                .branchId(request.getBranchId())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        return mapToUserResponse(savedUser);
    }

    /**
     * Update user role and/or status (admin function)
     */
    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getId());
        return mapToUserResponse(updatedUser);
    }

    /**
     * Deactivate user account (soft delete)
     */
    @Transactional
    public void deactivateUser(UUID userId) {
        log.info("Deactivating user with ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));

        user.setStatus(UserStatus.INACTIVE);
        userRepository.save(user);

        log.info("User deactivated successfully: {}", userId);
    }
}
