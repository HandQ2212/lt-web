package com.elc.system.modules.auth.controller;

import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.dto.UserDto.CreateUserRequest;
import com.elc.system.modules.auth.dto.UserDto.UpdateUserRequest;
import com.elc.system.modules.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Admin User Management Controller
 * All endpoints require MANAGER role
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MANAGER')")
public class UserController {

    private final UserService userService;

    /**
     * Get all users with pagination
     * GET /api/users?page=0&size=20&sort=fullName,asc
     */
    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /**
     * Get specific user by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Create new user account
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    /**
     * Update user role and/or status
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    /**
     * Deactivate user account (soft delete)
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }
}
