package com.stockflow.stockflowbackend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(
            RuntimeException ex) {

        HttpStatus status = HttpStatus.BAD_REQUEST;

        // Map specific messages to correct HTTP status codes
        String message = ex.getMessage();
        if (message != null) {
            if (message.contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.contains("not belong")
                    || message.contains("Unauthorized")) {
                status = HttpStatus.FORBIDDEN;
            } else if (message.contains("already exists")
                    || message.contains("already in use")) {
                status = HttpStatus.CONFLICT;
            } else if (message.contains("Insufficient")
                    || message.contains("not available")
                    || message.contains("blocked")) {
                status = HttpStatus.UNPROCESSABLE_ENTITY;
            } else if (message.contains("Invalid email or password")) {
                status = HttpStatus.UNAUTHORIZED;
            }
        }

        return ResponseEntity.status(status).body(Map.of(
                "error", message != null ? message : "An error occurred",
                "status", status.value(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneralException(
            Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "Internal server error",
                        "status", 500,
                        "timestamp", LocalDateTime.now().toString()
                ));
    }
}