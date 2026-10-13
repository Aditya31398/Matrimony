package com.soulsync.service;

import com.soulsync.dto.MatchDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Match;
import com.soulsync.model.Notification;
import com.soulsync.model.Profile;
import com.soulsync.repository.MatchRepository;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private static final int MAX_NOTE_LENGTH = 300;

    private final MatchRepository matchRepo;
    private final ProfileRepository profileRepo;
    private final ViewerContextService viewerContextService;
    private final ProfileCardMapper cardMapper;
    private final SafetyService safetyService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<MatchDTO> getMatches(Long profileId) {
        ViewerContext ctx = viewerContextService.forProfile(profileId);
        return matchRepo.findAcceptedMatches(ctx.viewer())
                .stream()
                .map(m -> toDto(m, other(m, profileId), ctx))
                .filter(dto -> !ctx.isHidden(dto.getProfile().getId()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getInterested(Long profileId) {
        ViewerContext ctx = viewerContextService.forProfile(profileId);
        return matchRepo.findByReceiverProfileAndStatus(ctx.viewer(), Match.Status.PENDING)
                .stream()
                .filter(m -> !ctx.isHidden(m.getSenderProfile().getId()))
                .map(m -> toDto(m, m.getSenderProfile(), ctx))
                .toList();
    }

    @Transactional
    public MatchDTO sendConnect(Long senderProfileId, Long receiverProfileId, String note) {
        if (senderProfileId.equals(receiverProfileId)) {
            throw new IllegalArgumentException("You can't connect with yourself");
        }
        safetyService.assertNotBlocked(senderProfileId, receiverProfileId);
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);
        String cleanNote = note == null || note.isBlank() ? null : note.trim();
        if (cleanNote != null && cleanNote.length() > MAX_NOTE_LENGTH) {
            throw new IllegalArgumentException("Note must be at most " + MAX_NOTE_LENGTH + " characters");
        }

        // They already asked us — connecting back makes it a match
        var reverse = matchRepo.findBySenderProfileAndReceiverProfile(receiver, sender);
        if (reverse.isPresent() && reverse.get().getStatus() == Match.Status.PENDING) {
            Match m = reverse.get();
            m.setStatus(Match.Status.ACCEPTED);
            matchRepo.save(m);
            notifyAccepted(m.getSenderProfile(), m.getReceiverProfile());
            return toDto(m, receiver, viewerContextService.forProfile(senderProfileId));
        }

        Match match = matchRepo.findBySenderProfileAndReceiverProfile(sender, receiver)
                .orElse(Match.builder().senderProfile(sender).receiverProfile(receiver).build());
        // A shortlist entry is private, so it can be upgraded to a real request
        if (match.getId() != null && match.getStatus() != Match.Status.SHORTLISTED) {
            throw new IllegalArgumentException(match.getStatus() == Match.Status.ACCEPTED
                    ? "You're already connected"
                    : "Connection request already sent");
        }
        match.setStatus(Match.Status.PENDING);
        match.setNote(cleanNote);
        matchRepo.save(match);

        notificationService.notify(receiver, sender, Notification.Type.INTEREST,
                sender.getFirstName() + " is interested in you" + (cleanNote == null ? "" : ": \"" + cleanNote + "\""),
                "/dashboard");
        return toDto(match, receiver, viewerContextService.forProfile(senderProfileId));
    }

    @Transactional
    public MatchDTO shortlist(Long senderProfileId, Long receiverProfileId) {
        if (senderProfileId.equals(receiverProfileId)) {
            throw new IllegalArgumentException("You can't shortlist yourself");
        }
        safetyService.assertNotBlocked(senderProfileId, receiverProfileId);
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);

        Match match = matchRepo.findBySenderProfileAndReceiverProfile(sender, receiver)
                .orElse(Match.builder().senderProfile(sender).receiverProfile(receiver).build());
        // Never downgrade a sent request or an accepted match to a shortlist entry
        if (match.getId() == null) {
            match.setStatus(Match.Status.SHORTLISTED);
            match = matchRepo.save(match);
        }
        return toDto(match, receiver, viewerContextService.forProfile(senderProfileId));
    }

    @Transactional
    public MatchDTO accept(Long matchId, Long callerProfileId) {
        Match match = matchRepo.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));
        // IDOR: only the receiver may accept
        if (!match.getReceiverProfile().getId().equals(callerProfileId)) {
            throw new AccessDeniedException("Not authorized to accept this match");
        }
        safetyService.assertNotBlocked(match.getSenderProfile().getId(), callerProfileId);
        match.setStatus(Match.Status.ACCEPTED);
        matchRepo.save(match);
        notifyAccepted(match.getSenderProfile(), match.getReceiverProfile());
        return toDto(match, match.getSenderProfile(), viewerContextService.forProfile(callerProfileId));
    }

    @Transactional
    public MatchDTO decline(Long matchId, Long callerProfileId) {
        Match match = matchRepo.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));
        // IDOR: only the receiver may decline
        if (!match.getReceiverProfile().getId().equals(callerProfileId)) {
            throw new AccessDeniedException("Not authorized to decline this match");
        }
        match.setStatus(Match.Status.DECLINED);
        matchRepo.save(match);
        return toDto(match, match.getSenderProfile(), viewerContextService.forProfile(callerProfileId));
    }

    private void notifyAccepted(Profile requester, Profile accepter) {
        notificationService.notify(requester, accepter, Notification.Type.ACCEPTED,
                accepter.getFirstName() + " accepted your request — you're now connected",
                "/profile/" + accepter.getId());
    }

    private MatchDTO toDto(Match m, Profile other, ViewerContext ctx) {
        return MatchDTO.of(m, cardMapper.summary(other, ctx));
    }

    private static Profile other(Match m, Long profileId) {
        return m.getSenderProfile().getId().equals(profileId) ? m.getReceiverProfile() : m.getSenderProfile();
    }

    private Profile getProfileOrThrow(Long id) {
        return profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }
}
