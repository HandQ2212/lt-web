package com.elc.system.modules.auth.exception;

/**
 * Exception thrown when a user is not found in the system.
 * Returns HTTP 404 status code.
 */
public class UserNotFoundException extends AuthException {

    public UserNotFoundException(String message) {
        super(message, 404);
    }

    public UserNotFoundException(String message, Throwable cause) {
        super(message, 404, cause);
    }
}
