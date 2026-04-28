package com.elc.system.core.exception;

import com.elc.system.modules.auth.exception.*;
import jakarta.validation.ConstraintViolationException;
import com.elc.system.modules.room.exception.RoomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.ZonedDateTime;
import java.util.stream.Collectors;

/**
 * Global exception handler for all REST controllers.
 * Provides standardized error responses for different types of exceptions.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoomException.class)
    public ResponseEntity<ErrorResponse> handleRoomException(RoomException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.valueOf(ex.getStatus()).getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(ex.getStatus()).body(error);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(401)
                .message("Invalid email or password")
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(400)
                .message(ex.getMessage())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
                .collect(Collectors.joining("; "));

        ErrorResponse error = ErrorResponse.builder()
                .status(400)
                .message(message.isBlank() ? "Validation failed" : message)
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(400)
                .message(ex.getMessage())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ex.printStackTrace();
        ErrorResponse error = ErrorResponse.builder()
                .status(500)
                .message("Internal server error")
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
