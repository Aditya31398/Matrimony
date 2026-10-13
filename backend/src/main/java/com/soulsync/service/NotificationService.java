package com.soulsync.service;

import com.soulsync.dto.NotificationDTO;
import com.soulsync.model.Notification;
import com.soulsync.model.Profile;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final int PAGE_SIZE = 30;

    private final NotificationRepository notificationRepo;
    private final BlockRepository blockRepo;

    @Transactional
    public void notify(Profile recipient, Profile actor, Notification.Type type, String text, String link) {
        if (actor != null && blockRepo.existsByBlockerIdAndBlockedId(recipient.getId(), actor.getId())) return;
        // One unread "new message" entry per sender, refreshed rather than stacked
        if (type == Notification.Type.MESSAGE && actor != null) {
            notificationRepo.findFirstByRecipientIdAndActorIdAndTypeAndReadFalse(recipient.getId(), actor.getId(), type)
                    .ifPresent(notificationRepo::delete);
        }
        notificationRepo.save(Notification.builder()
                .recipient(recipient).actor(actor).type(type)
                .text(text.length() > 300 ? text.substring(0, 297) + "…" : text)
                .link(link)
                .build());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> list(ViewerContext ctx) {
        return notificationRepo.findByRecipientIdOrderByCreatedAtDesc(ctx.viewerId(), PageRequest.of(0, PAGE_SIZE))
                .stream()
                .filter(n -> n.getActor() == null || !ctx.isHidden(n.getActor().getId()))
                .map(n -> {
                    Profile a = n.getActor();
                    return NotificationDTO.builder()
                            .id(n.getId())
                            .type(n.getType().name())
                            .text(n.getText())
                            .link(n.getLink())
                            .read(Boolean.TRUE.equals(n.getRead()))
                            .createdAt(n.getCreatedAt())
                            .actorId(a == null ? null : a.getId())
                            .actorName(a == null ? null : a.getFirstName())
                            .actorPhotoUrl(a == null || !ctx.canSeePhotoOf(a) ? null : a.getPhotoUrl())
                            .build();
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long profileId) {
        return notificationRepo.countByRecipientIdAndReadFalse(profileId);
    }

    @Transactional
    public void markAllRead(Long profileId) {
        notificationRepo.markAllRead(profileId);
    }

    @Transactional
    public void markRead(Long notificationId, Long profileId) {
        Notification n = notificationRepo.findById(notificationId).orElse(null);
        if (n == null) return;
        if (!n.getRecipient().getId().equals(profileId)) throw new AccessDeniedException("Not your notification");
        n.setRead(true);
    }
}
