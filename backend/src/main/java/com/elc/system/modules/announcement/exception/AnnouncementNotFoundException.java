package com.elc.system.modules.announcement.exception;

/**
 * Exception thrown when an announcement is not found in the system.
 * Returns HTTP 404 status code.
 */
public class AnnouncementNotFoundException extends RuntimeException {

    public AnnouncementNotFoundException(String message) {
        super(message);
    }

    public AnnouncementNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
