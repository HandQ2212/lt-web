package com.elc.system.modules.auth.exception;

/**
 * Base exception for authentication-related errors.
 * Allows custom HTTP status codes for different auth failure scenarios.
 */
public class AuthException extends RuntimeException {

    private final int status;

    public AuthException(String message, int status) {
        super(message);
        this.status = status;
    }

    public AuthException(String message, int status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public int getStatus() {
        return status;
    }
}
