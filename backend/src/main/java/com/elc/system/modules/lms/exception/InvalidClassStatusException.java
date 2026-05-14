package com.elc.system.modules.lms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidClassStatusException extends RuntimeException {
    private final int status;

    public InvalidClassStatusException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST.value();
    }

    public int getStatus() {
        return status;
    }
}
