package com.elc.system.modules.room.exception;

public class RoomNotFoundException extends RoomException {
    public RoomNotFoundException(String message) {
        super(message, 404);
    }
}
