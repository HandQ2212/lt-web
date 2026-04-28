package com.elc.system.modules.notification.service;

import com.elc.system.modules.auth.entity.User;
import com.elc.system.modules.auth.service.UserService;
import com.elc.system.modules.notification.dto.NotificationDto.NotificationResponse;
import com.elc.system.modules.notification.dto.NotificationDto.UnreadCountResponse;
import com.elc.system.modules.notification.entity.Notification;
import com.elc.system.modules.notification.entity.NotificationType;
import com.elc.system.modules.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User user = userService.getCurrentUser();
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    public UnreadCountResponse getUnreadCount() {
        User user = userService.getCurrentUser();
        long count = notificationRepository.countByUserIdAndReadFalse(user.getId());
        return UnreadCountResponse.builder().count(count).build();
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found with id: " + notificationId));

        // Security: Ensure user only marks their own notification
        User currentUser = userService.getCurrentUser();
        if (!notification.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Access denied: You do not have permission to mark this notification as read");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
        log.info("Notification {} marked as read by user {}", notificationId, currentUser.getEmail());
    }

    @Transactional
    public void markAllAsRead() {
        User user = userService.getCurrentUser();
        notificationRepository.markAllAsRead(user.getId());
        log.info("All notifications marked as read for user: {}", user.getEmail());
    }

    @Transactional
    public void createNotification(User user, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .read(false)
                .type(type)
                .build();
        notificationRepository.save(notification);
        log.info("Notification created for user {}: {}", user.getEmail(), title);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .type(notification.getType() != null ? notification.getType().name() : null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
