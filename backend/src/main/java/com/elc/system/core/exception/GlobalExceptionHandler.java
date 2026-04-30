package com.elc.system.core.exception;

import com.elc.system.modules.auth.exception.*;
import com.elc.system.modules.notification.exception.NotificationNotFoundException;
import jakarta.validation.ConstraintViolationException;
import com.elc.system.modules.room.exception.RoomException;
import com.elc.system.modules.lms.exception.ClassDeletionException;
import com.elc.system.modules.lms.exception.InvalidClassStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
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

    @ExceptionHandler(NotificationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotificationNotFound(NotificationNotFoundException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(404)
                .message(ex.getMessage())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
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

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Parameter '%s' should be of type '%s'", 
                ex.getName(), ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "unknown");
        
        ErrorResponse error = ErrorResponse.builder()
                .status(400)
                .message(message)
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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
 
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        // Many service layer errors are thrown as RuntimeException (e.g., "User not found")
        // We catch them here to avoid 500 Internal Server Error for business logic issues.
        HttpStatus status = HttpStatus.BAD_REQUEST;
        String message = ex.getMessage();
        
        // Custom check for "not found" or "incorrect password" messages
        if (message != null && (message.toLowerCase().contains("not found") || message.toLowerCase().contains("incorrect"))) {
            // keep it as 400 for now or refine
        }

        ErrorResponse error = ErrorResponse.builder()
                .status(status.value())
                .message(message)
                .error(status.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(status).body(error);
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

    @ExceptionHandler(InvalidClassStatusException.class)
    public ResponseEntity<ErrorResponse> handleInvalidClassStatus(InvalidClassStatusException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ClassDeletionException.class)
    public ResponseEntity<ErrorResponse> handleClassDeletion(ClassDeletionException ex) {
        ErrorResponse error = ErrorResponse.builder()
                .status(ex.getStatus())
                .message(ex.getMessage())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .timestamp(ZonedDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
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
