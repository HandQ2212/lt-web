package com.elc.system.modules.room.exception;

public class RoomConflictException extends RoomException {
    public RoomConflictException(String message) {
        super(message, 409);
    }
}
