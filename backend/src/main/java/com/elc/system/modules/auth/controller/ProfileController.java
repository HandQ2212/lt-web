package com.elc.system.modules.auth.controller;

import com.elc.system.modules.auth.dto.AuthDto.ChangePasswordRequest;
import com.elc.system.modules.auth.dto.AuthDto.ProfileUpdateRequest;
import com.elc.system.modules.auth.dto.AuthDto.UserResponse;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(UserResponse.builder()
                .id(currentUser.getId())
                .email(currentUser.getEmail())
                .fullName(currentUser.getFullName())
                .role(currentUser.getRole())
                .build());
    }

    @PutMapping
    public ResponseEntity<String> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request) {
        userService.updateProfile(request);
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return ResponseEntity.ok("Password changed successfully");
    }
}
