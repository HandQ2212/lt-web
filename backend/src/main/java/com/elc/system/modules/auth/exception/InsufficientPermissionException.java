package com.elc.system.modules.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class InsufficientPermissionException extends RuntimeException {

    public InsufficientPermissionException(String message) {
        super(message);
    }

    public InsufficientPermissionException() {
        super("Insufficient permission");
    }
}
