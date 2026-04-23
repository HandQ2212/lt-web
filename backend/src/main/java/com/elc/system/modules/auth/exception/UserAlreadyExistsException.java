package com.elc.system.modules.auth.exception;

/**
 * Exception thrown when attempting to register with an email that already exists.
 * HTTP Status: 409 Conflict
 */
public class UserAlreadyExistsException extends AuthException {

    public UserAlreadyExistsException(String email) {
        super("Email already exists: " + email, 409);
    }
}
