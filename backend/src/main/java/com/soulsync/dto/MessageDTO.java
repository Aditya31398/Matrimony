package com.soulsync.dto;

import com.soulsync.model.Message;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String content;
    private String sentAt;
    private Boolean isRead;
    private Boolean isOwn;   // true if sender == requesting profile

    public static MessageDTO from(Message m, Long viewerProfileId) {
        boolean own = m.getSenderProfile() != null && m.getSenderProfile().getId().equals(viewerProfileId);
        String time = m.getSentAt() != null
                ? m.getSentAt().format(DateTimeFormatter.ofPattern("hh:mm a"))
                : "";
        return MessageDTO.builder()
                .id(m.getId())
                .senderId(m.getSenderProfile() != null ? m.getSenderProfile().getId() : null)
                .content(m.getContent())
                .sentAt(time)
                .isRead(m.getIsRead())
                .isOwn(own)
                .build();
    }
}
