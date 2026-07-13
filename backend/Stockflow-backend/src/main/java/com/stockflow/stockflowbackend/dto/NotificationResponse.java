package com.stockflow.stockflowbackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String body;
    private Boolean read;
    private LocalDateTime createdAt;

    public NotificationResponse(Long id, String type, String title, String body,
                                Boolean read, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.body = body;
        this.read = read;
        this.createdAt = createdAt;
    }
}
