package com.soulsync.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private Long id;
    private String type;
    private String text;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
    private Long actorId;
    private String actorName;
    private String actorPhotoUrl;
}
