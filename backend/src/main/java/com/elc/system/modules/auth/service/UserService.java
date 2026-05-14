package com.elc.system.modules.auth.service;

import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.dto.UserDto.CreateUserRequest;
import com.elc.system.modules.auth.dto.UserDto.PublicTeacherResponse;
import com.elc.system.modules.auth.dto.UserDto.UpdateUserRequest;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.entity.UserStatus;
import com.elc.system.modules.auth.exception.UserAlreadyExistsException;
import com.elc.system.modules.auth.exception.UserNotFoundException;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.lms.entity.ClassStatus;
import com.elc.system.modules.lms.entity.Clazz;
import com.elc.system.modules.lms.repository.ClazzRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClazzRepository clazzRepository;
    private final PasswordEncoder passwordEncoder;

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .branchId(user.getBranchId())
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

    public List<UserResponse> getActiveTeachers() {
        log.info("Fetching active teachers");
        return userRepository.findActiveByRole(UserRole.TEACHER).stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PublicTeacherResponse> getPublicTeachers() {
        log.info("Fetching public teacher profiles");
        return userRepository.findActiveByRole(UserRole.TEACHER).stream()
                .sorted((left, right) -> String.CASE_INSENSITIVE_ORDER.compare(left.getFullName(), right.getFullName()))
                .map(this::mapToPublicTeacherResponse)
                .collect(Collectors.toList());
    }

    private PublicTeacherResponse mapToPublicTeacherResponse(User teacher) {
        List<Clazz> classes = clazzRepository.findByTeacherId(teacher.getId());
        List<String> specialties = classes.stream()
                .map(clazz -> clazz.getLevel() != null && clazz.getLevel().getCourse() != null
                        ? clazz.getLevel().getCourse().getName()
                        : null)
                .filter(Objects::nonNull)
                .filter(name -> !name.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
        long activeClassCount = classes.stream()
                .filter(clazz -> clazz.getStatus() != ClassStatus.CANCELLED && clazz.getStatus() != ClassStatus.COMPLETED)
                .count();

        return PublicTeacherResponse.builder()
                .id(teacher.getId())
                .fullName(teacher.getFullName())
                .avatarUrl(teacher.getAvatarUrl())
                .specialties(specialties)
                .activeClassCount(activeClassCount)
                .build();
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
