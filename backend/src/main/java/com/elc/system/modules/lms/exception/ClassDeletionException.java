package com.elc.system.modules.lms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ClassDeletionException extends RuntimeException {
    private final int status;

    public ClassDeletionException(String message) {
        super(message);
        this.status = HttpStatus.CONFLICT.value();
    }

    public int getStatus() {
        return status;
    }
}
