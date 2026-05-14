package com.elc.system.modules.notification.exception;

/**
 * Exception thrown when a notification is not found in the system.
 * Returns HTTP 404 status code.
 */
public class NotificationNotFoundException extends RuntimeException {

    public NotificationNotFoundException(String message) {
        super(message);
    }

    public NotificationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
