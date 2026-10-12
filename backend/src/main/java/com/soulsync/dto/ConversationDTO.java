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
     * Build a DTO from denormalized conversation fields + a pre-computed unread count.
     * Does NOT access conv.getMessages(), so no N+1 or full message load.
     */
    public static ConversationDTO from(Conversation conv, Long viewerProfileId, int unreadCount) {
        return from(conv, viewerProfileId, unreadCount, true);
    }

    public static ConversationDTO from(Conversation conv, Long viewerProfileId, int unreadCount,
                                       boolean viewerIsPremium) {
        boolean viewerIsP1 = conv.getProfile1().getId().equals(viewerProfileId);
        var other = viewerIsP1 ? conv.getProfile2() : conv.getProfile1();

        String lastMsg  = conv.getLastMessagePreview() != null ? conv.getLastMessagePreview() : "";
        String lastTime = conv.getLastMessageAt() != null ? "Just now" : "";

        ProfileSummaryDTO otherDTO = ProfileSummaryDTO.from(other);
        return ConversationDTO.builder()
                .id(conv.getId().toString())
                .otherProfile(otherDTO)
                .lastMessage(lastMsg)
                .lastMessageTime(lastTime)
                .isOnline(viewerIsPremium && Boolean.TRUE.equals(otherDTO.getIsOnline()))
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

    /** Convenience overload for newly created conversations (no messages yet). */
    public static ConversationDTO from(Conversation conv, Long viewerProfileId) {
        return from(conv, viewerProfileId, 0);
    }
}
