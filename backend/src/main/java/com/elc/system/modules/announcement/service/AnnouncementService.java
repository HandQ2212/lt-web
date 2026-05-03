package com.elc.system.modules.announcement.service;

import com.elc.system.modules.announcement.dto.AnnouncementDto.AnnouncementResponse;
import com.elc.system.modules.announcement.dto.AnnouncementDto.CreateAnnouncementRequest;
import com.elc.system.modules.announcement.entity.Announcement;
import com.elc.system.modules.announcement.entity.AnnouncementScope;
import com.elc.system.modules.announcement.entity.AnnouncementType;
import com.elc.system.modules.announcement.repository.AnnouncementRepository;
import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.entity.UserRole;
import com.elc.system.modules.auth.exception.InsufficientPermissionException;
import com.elc.system.modules.auth.repository.UserRepository;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @Transactional
    public AnnouncementResponse createAnnouncement(CreateAnnouncementRequest request) {
        User currentUser = userService.getCurrentUser();

        // ⚠️ AUTHORIZATION CHECK - Validate create permission
        validateCreatePermission(currentUser, request);

        // Create announcement
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .scope(request.getScope())
                .targetRole(request.getTargetRole())
                .targetClassId(request.getTargetClassId())
                .createdBy(currentUser)
                .expiresAt(request.getExpiresAt())
                .active(true)
                .build();

        announcementRepository.save(announcement);

        // Return response first (transaction commits here)
        AnnouncementResponse response = mapToResponse(announcement);

        // Deliver notifications AFTER transaction (separate call)
        deliverToUsersAsync(announcement);

        return response;
    }

    // ⚠️ PHẦN QUAN TRỌNG - Authorization Logic
    private void validateCreatePermission(User user, CreateAnnouncementRequest request) {
        UserRole role = user.getRole();

        switch (request.getScope()) {
            case CENTER:
                // Chỉ MANAGER mới được tạo CENTER announcement
                if (role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only MANAGER can create CENTER announcements");
                }
                break;

            case ROLE:
                // Chỉ MANAGER mới được tạo ROLE-based announcement
                if (role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only MANAGER can create ROLE-based announcements");
                }
                break;

            case CLASS:
                // TEACHER và MANAGER đều được tạo CLASS announcement
                if (role != UserRole.TEACHER && role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only TEACHER or MANAGER can create CLASS announcements");
                }
                break;

            case FINANCE:
                // ACCOUNTANT và MANAGER đều được tạo FINANCE announcement
                if (role != UserRole.ACCOUNTANT && role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only ACCOUNTANT or MANAGER can create FINANCE announcements");
                }
                break;
        }
    }

    // ⚠️ JUNCTION LOGIC - Get target users và create notifications
    @Transactional
    public void deliverToUsersAsync(Announcement announcement) {
        List<User> targetUsers = getTargetUsers(announcement);

        // Create notification records cho mỗi target user
        for (User user : targetUsers) {
            try {
                notificationService.createNotification(
                        user,
                        announcement.getTitle(),
                        announcement.getMessage(),
                        NotificationType.ANNOUNCEMENT
                );
            } catch (Exception e) {
                log.error("Failed to create notification for user {}: {}", user.getEmail(), e.getMessage());
            }
        }

        // Mark as delivered
        announcement.setDeliveredAt(ZonedDateTime.now());
        announcementRepository.save(announcement);

        log.info("Announcement {} delivered to {} users", announcement.getId(), targetUsers.size());
    }

    // ⚠️ TARGET USER LOGIC - Query users theo scope
    private List<User> getTargetUsers(Announcement announcement) {
        return switch (announcement.getScope()) {
            case CENTER -> userRepository.findAll(); // All users
            case ROLE -> userRepository.findActiveByRole(announcement.getTargetRole());
            case CLASS -> {
                // TODO: Implement khi có Class entity
                // userRepository.findByClassId(announcement.getTargetClassId());
                log.warn("CLASS scope not fully implemented - delivering to all users");
                yield userRepository.findAll(); // Temporary: return all
            }
            case FINANCE -> {
                // STUDENT và LEAD role
                yield userRepository.findAll().stream()
                        .filter(u -> u.getRole() == UserRole.STUDENT || u.getRole() == UserRole.LEAD)
                        .toList();
            }
        };
    }

    public Page<AnnouncementResponse> getActiveAnnouncements(Pageable pageable) {
        ZonedDateTime now = ZonedDateTime.now();
        return announcementRepository.findActiveAnnouncements(now, pageable)
                .map(this::mapToResponse);
    }

    private AnnouncementResponse mapToResponse(Announcement announcement) {
        // Load createdBy user separately to avoid lazy loading issues
        User createdBy = userRepository.findById(announcement.getCreatedBy().getId()).orElse(null);

        return AnnouncementResponse.builder()
                .id(announcement.getId())
                .title(announcement.getTitle())
                .message(announcement.getMessage())
                .type(announcement.getType().name())
                .scope(announcement.getScope().name())
                .targetRole(announcement.getTargetRole() != null ? announcement.getTargetRole().name() : null)
                .targetClassId(announcement.getTargetClassId())
                .createdByEmail(createdBy != null ? createdBy.getEmail() : null)
                .createdByFullName(createdBy != null ? createdBy.getFullName() : null)
                .createdAt(announcement.getCreatedAt())
                .expiresAt(announcement.getExpiresAt())
                .isActive(announcement.isActive())
                .isDelivered(announcement.isDelivered())
                .build();
    }
}
