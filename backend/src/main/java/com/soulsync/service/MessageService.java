package com.soulsync.service;

import com.soulsync.dto.ConversationDTO;
import com.soulsync.dto.MessageDTO;
import com.soulsync.exception.PremiumRequiredException;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Conversation;
import com.soulsync.model.Message;
import com.soulsync.model.Notification;
import com.soulsync.model.Profile;
import com.soulsync.repository.ConversationRepository;
import com.soulsync.repository.MessageRepository;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final ConversationRepository convRepo;
    private final MessageRepository msgRepo;
    private final ProfileRepository profileRepo;
    private final SimpMessagingTemplate messagingTemplate;
    private final ViewerContextService viewerContextService;
    private final ProfileCardMapper cardMapper;
    private final SafetyService safetyService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(Long profileId) {
        ViewerContext ctx = viewerContextService.forProfile(profileId);
        return convRepo.findByProfile(ctx.viewer())
                .stream()
                .filter(c -> !c.getProfile1().getId().equals(c.getProfile2().getId()))
                .filter(c -> !ctx.isHidden(otherParticipant(c, profileId).getId()))
                .map(c -> ConversationDTO.from(c, (int) msgRepo.countUnread(c, profileId),
                        cardMapper.summary(otherParticipant(c, profileId), ctx)))
                .toList();
    }

    @Transactional
    public List<MessageDTO> getMessages(Long conversationId, Long viewerProfileId) {
        Conversation conv = convRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        assertParticipant(conv, viewerProfileId);
        msgRepo.markRead(conv, viewerProfileId);
        return msgRepo.findByConversationOrderBySentAtAsc(conv)
                .stream()
                .map(m -> MessageDTO.from(m, viewerProfileId))
                .toList();
    }

    @Transactional
    public MessageDTO sendMessage(Long conversationId, Long senderProfileId, String content) {
        Conversation conv = convRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        assertParticipant(conv, senderProfileId);
        Profile sender = getProfileOrThrow(senderProfileId);
        requirePremium(sender);
        Profile recipient = otherParticipant(conv, senderProfileId);
        safetyService.assertNotBlocked(senderProfileId, recipient.getId());

        Message msg = Message.builder()
                .conversation(conv)
                .senderProfile(sender)
                .content(content)
                .isRead(false)
                .build();
        msg = msgRepo.save(msg);

        // Denormalized fields — keep conversation list sorted without loading all messages
        String preview = content.length() > 80 ? content.substring(0, 77) + "…" : content;
        conv.setLastMessageAt(msg.getSentAt());
        conv.setLastMessagePreview(preview);
        conv.setLastSenderId(senderProfileId);
        convRepo.save(conv);

        MessageDTO dto = MessageDTO.from(msg, senderProfileId);

        // Push new message to all clients watching this conversation (real-time, no polling)
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, dto);

        // Notify both participants' inbox feeds so their conversation list refreshes
        messagingTemplate.convertAndSend("/topic/inbox/" + conv.getProfile1().getId(),
                Map.of("type", "new_message", "conversationId", conversationId));
        messagingTemplate.convertAndSend("/topic/inbox/" + conv.getProfile2().getId(),
                Map.of("type", "new_message", "conversationId", conversationId));

        notificationService.notify(recipient, sender, Notification.Type.MESSAGE,
                sender.getFirstName() + ": " + preview, "/messages/" + conversationId);

        return dto;
    }

    @Transactional
    public ConversationDTO getOrCreateConversation(Long profileId1, Long profileId2) {
        if (profileId1.equals(profileId2)) throw new IllegalArgumentException("Cannot message yourself");
        Profile p1 = getProfileOrThrow(profileId1);
        Profile p2 = getProfileOrThrow(profileId2);
        requirePremium(p1);
        safetyService.assertNotBlocked(profileId1, profileId2);
        Conversation conv = convRepo.findByProfiles(p1, p2)
                .orElseGet(() -> convRepo.save(Conversation.builder().profile1(p1).profile2(p2).build()));
        return ConversationDTO.from(conv, 0, cardMapper.summary(p2, viewerContextService.forProfile(profileId1)));
    }

    public void assertParticipant(Long conversationId, Long profileId) {
        Conversation conv = convRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
        assertParticipant(conv, profileId);
    }

    public List<Map<String, Object>> getIcebreakers(Long conversationId) {
        return List.of(
                Map.of("id", 1, "topic", "Shared Interests",
                        "prompt", "What's something you're genuinely passionate about that most people don't know?",
                        "featured", true),
                Map.of("id", 2, "topic", "Travel",
                        "prompt", "What's the most memorable trip you've ever taken and why?",
                        "featured", false),
                Map.of("id", 3, "topic", "Lifestyle",
                        "prompt", "Morning person or night owl? What does your ideal weekend look like?",
                        "featured", false)
        );
    }

    private void assertParticipant(Conversation conv, Long profileId) {
        boolean isParticipant = conv.getProfile1().getId().equals(profileId)
                || conv.getProfile2().getId().equals(profileId);
        if (!isParticipant) throw new AccessDeniedException("Not a participant in this conversation");
    }

    private static Profile otherParticipant(Conversation c, Long profileId) {
        return c.getProfile1().getId().equals(profileId) ? c.getProfile2() : c.getProfile1();
    }

    private static void requirePremium(Profile profile) {
        if (!profile.hasActivePremium()) {
            throw new PremiumRequiredException("Upgrade to Premium to chat with other members");
        }
    }

    private Profile getProfileOrThrow(Long id) {
        return profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }
}
