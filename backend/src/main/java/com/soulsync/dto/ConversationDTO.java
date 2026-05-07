package com.soulsync.dto;

import com.soulsync.model.Conversation;
import com.soulsync.model.Message;
import lombok.Builder;
import lombok.Data;

import java.util.Comparator;
import java.util.List;

@Data
@Builder
public class ConversationDTO {
    private String id;
    private ProfileSummaryDTO otherProfile;
    private String lastMessage;
    private String lastMessageTime;
    private Boolean isOnline;
    private Integer unreadCount;

    public static ConversationDTO from(Conversation conv, Long viewerProfileId) {
        boolean viewerIsP1 = conv.getProfile1().getId().equals(viewerProfileId);
        var other = viewerIsP1 ? conv.getProfile2() : conv.getProfile1();

        List<Message> msgs = conv.getMessages();
        String lastMsg = "";
        String lastTime = "";
        int unread = 0;

        if (!msgs.isEmpty()) {
            Message latest = msgs.stream()
                    .max(Comparator.comparing(Message::getSentAt))
                    .orElse(null);
            if (latest != null) {
                lastMsg = latest.getContent().length() > 60
                        ? latest.getContent().substring(0, 57) + "…"
                        : latest.getContent();
                lastTime = "Just now";
                unread = (int) msgs.stream()
                        .filter(m -> !m.getSenderProfile().getId().equals(viewerProfileId) && !m.getIsRead())
                        .count();
            }
        }

        ProfileSummaryDTO otherDTO = ProfileSummaryDTO.from(other);
        return ConversationDTO.builder()
                .id(conv.getId().toString())
                .otherProfile(otherDTO)
                .lastMessage(lastMsg)
                .lastMessageTime(lastTime)
                .isOnline(Boolean.TRUE.equals(otherDTO.getIsOnline()))
                .unreadCount(unread)
                .build();
    }
}
