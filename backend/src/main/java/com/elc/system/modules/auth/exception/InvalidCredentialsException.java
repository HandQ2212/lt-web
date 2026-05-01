package com.elc.system.modules.auth.exception;

/**
 * Exception thrown when login credentials are invalid.
 * HTTP Status: 401 Unauthorized
 */
public class InvalidCredentialsException extends AuthException {

    public InvalidCredentialsException() {
        super("Invalid email or password", 401);
    }

    public InvalidCredentialsException(String message) {
        super(message, 401);
    }
}
