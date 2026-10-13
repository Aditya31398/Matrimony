package com.soulsync.dto;

import com.soulsync.model.Conversation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
public class ConversationDTO {
    private String id;
    private ProfileSummaryDTO otherProfile;
    private String lastMessage;
    private String lastMessageTime;
    private Boolean isOnline;
    private Integer unreadCount;

    /**
     * Built from denormalized conversation fields and a pre-computed unread count, so it
     * never loads the messages. {@code other} is the other participant's card, already
     * prepared for the viewer.
     */
    public static ConversationDTO from(Conversation conv, int unreadCount, ProfileSummaryDTO other) {
        String lastMsg  = conv.getLastMessagePreview() != null ? conv.getLastMessagePreview() : "";
        return ConversationDTO.builder()
                .id(conv.getId().toString())
                .otherProfile(other)
                .lastMessage(lastMsg)
                .lastMessageTime(formatTime(conv.getLastMessageAt()))
                .isOnline(!other.isRestricted() && Boolean.TRUE.equals(other.getIsOnline()))
                .unreadCount(unreadCount)
                .build();
    }

    /** "Just now", "10:42 AM" today, "Yesterday", or "12 Oct" for older messages. */
    private static String formatTime(LocalDateTime at) {
        if (at == null) return "";
        LocalDateTime now = LocalDateTime.now();
        if (at.isAfter(now.minusMinutes(1))) return "Just now";
        if (at.toLocalDate().equals(now.toLocalDate())) return at.format(DateTimeFormatter.ofPattern("hh:mm a"));
        if (at.toLocalDate().equals(now.toLocalDate().minusDays(1))) return "Yesterday";
        return at.format(DateTimeFormatter.ofPattern("d MMM"));
    }
}
