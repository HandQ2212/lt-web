package com.elc.system.modules.auth.exception;

/**
 * Exception thrown when a token (access or refresh) is invalid or expired.
 * HTTP Status: 401 Unauthorized
 */
public class InvalidTokenException extends AuthException {

    public InvalidTokenException() {
        super("Invalid or expired token", 401);
    }

    public InvalidTokenException(String message) {
        super(message, 401);
    }
}
