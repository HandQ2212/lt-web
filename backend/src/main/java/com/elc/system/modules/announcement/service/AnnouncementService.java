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
import com.elc.system.modules.lms.repository.ClazzRepository;
import com.elc.system.modules.lms.repository.EnrollmentRepository;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final ClazzRepository clazzRepository;
    private final EnrollmentRepository enrollmentRepository;
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
                if (request.getTargetRole() == null) {
                    throw new IllegalArgumentException("Target role is required for ROLE announcements");
                }
                break;

            case CLASS:
                // TEACHER và MANAGER đều được tạo CLASS announcement
                if (role != UserRole.TEACHER && role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only TEACHER or MANAGER can create CLASS announcements");
                }
                validateClassTarget(user, request);
                break;

            case FINANCE:
                // ACCOUNTANT và MANAGER đều được tạo FINANCE announcement
                if (role != UserRole.ACCOUNTANT && role != UserRole.MANAGER) {
                    throw new InsufficientPermissionException("Only ACCOUNTANT or MANAGER can create FINANCE announcements");
                }
                break;
        }
    }

    private void validateClassTarget(User user, CreateAnnouncementRequest request) {
        if (request.getTargetClassId() == null) {
            throw new IllegalArgumentException("Target class is required for CLASS announcements");
        }

        if (!clazzRepository.existsById(request.getTargetClassId())) {
            throw new IllegalArgumentException("Class not found with id: " + request.getTargetClassId());
        }

        if (user.getRole() == UserRole.TEACHER
                && !clazzRepository.existsByIdAndTeacherId(request.getTargetClassId(), user.getId())) {
            throw new InsufficientPermissionException("Teacher can only create announcements for assigned classes");
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
                        NotificationType.ANNOUNCEMENT,
                        announcement.getCreatedBy(),
                        announcement
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
                if (announcement.getTargetClassId() == null) {
                    yield List.of();
                }
                yield enrollmentRepository.findActiveStudentsByClassId(announcement.getTargetClassId());
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
        User currentUser = userService.getCurrentUser();

        if (currentUser.getRole() == UserRole.MANAGER) {
            return announcementRepository.findActiveAnnouncements(now, pageable)
                    .map(this::mapToResponse);
        }

        List<Announcement> activeAnnouncements = announcementRepository
                .findActiveAnnouncements(now, Pageable.unpaged(Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
        Set<UUID> visibleClassIds = getVisibleClassIds(currentUser);
        List<Announcement> visibleAnnouncements = activeAnnouncements.stream()
                .filter(announcement -> canViewAnnouncement(currentUser, visibleClassIds, announcement))
                .toList();

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), visibleAnnouncements.size());
        List<Announcement> pageContent = start >= visibleAnnouncements.size()
                ? List.of()
                : visibleAnnouncements.subList(start, end);

        return new PageImpl<>(pageContent, pageable, visibleAnnouncements.size())
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getMySentAnnouncements(Pageable pageable) {
        User currentUser = userService.getCurrentUser();
        if (!canCreateAnnouncements(currentUser.getRole())) {
            throw new InsufficientPermissionException("Current role cannot create announcements");
        }
        return announcementRepository.findByCreatedByIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    private boolean canCreateAnnouncements(UserRole role) {
        return role == UserRole.MANAGER || role == UserRole.TEACHER || role == UserRole.ACCOUNTANT;
    }

    private Set<UUID> getVisibleClassIds(User user) {
        if (user.getRole() == UserRole.TEACHER) {
            return clazzRepository.findByTeacherId(user.getId()).stream()
                    .map(clazz -> clazz.getId())
                    .collect(Collectors.toSet());
        }

        if (user.getRole() == UserRole.STUDENT || user.getRole() == UserRole.LEAD) {
            return enrollmentRepository.findByStudentId(user.getId()).stream()
                    .filter(enrollment -> List.of(
                            com.elc.system.modules.lms.entity.EnrollmentStatus.PENDING,
                            com.elc.system.modules.lms.entity.EnrollmentStatus.APPROVED,
                            com.elc.system.modules.lms.entity.EnrollmentStatus.ACTIVE
                    ).contains(enrollment.getStatus()))
                    .map(enrollment -> enrollment.getClazz().getId())
                    .collect(Collectors.toSet());
        }

        return Set.of();
    }

    private boolean canViewAnnouncement(User user, Set<UUID> visibleClassIds, Announcement announcement) {
        return switch (announcement.getScope()) {
            case CENTER -> true;
            case ROLE -> announcement.getTargetRole() == user.getRole();
            case CLASS -> announcement.getTargetClassId() != null
                    && visibleClassIds.contains(announcement.getTargetClassId());
            case FINANCE -> user.getRole() == UserRole.STUDENT
                    || user.getRole() == UserRole.LEAD
                    || user.getRole() == UserRole.ACCOUNTANT;
        };
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
