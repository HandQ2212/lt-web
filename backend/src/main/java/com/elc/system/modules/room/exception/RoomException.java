package com.elc.system.modules.room.exception;

import lombok.Getter;

@Getter
public class RoomException extends RuntimeException {
    private final int status;
    public RoomException(String message, int status) {
        super(message);
        this.status = status;
    }
}
