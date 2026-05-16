package com.soulsync.dto;

import com.soulsync.model.Conversation;
import lombok.Builder;
import lombok.Data;

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
                .isOnline(Boolean.TRUE.equals(otherDTO.getIsOnline()))
                .unreadCount(unreadCount)
                .build();
    }

    /** Convenience overload for newly created conversations (no messages yet). */
    public static ConversationDTO from(Conversation conv, Long viewerProfileId) {
        return from(conv, viewerProfileId, 0);
    }
}
