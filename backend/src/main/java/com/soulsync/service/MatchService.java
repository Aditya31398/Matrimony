package com.soulsync.service;

import com.soulsync.dto.MatchDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Match;
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

    private final MatchRepository matchRepo;
    private final ProfileRepository profileRepo;

    @Transactional(readOnly = true)
    public List<MatchDTO> getMatches(Long profileId) {
        Profile profile = getProfileOrThrow(profileId);
        boolean premium = profile.hasActivePremium();
        return matchRepo.findAcceptedMatches(profile)
                .stream()
                .map(m -> m.getSenderProfile().getId().equals(profileId)
                        ? MatchDTO.fromSent(m, premium)
                        : MatchDTO.fromReceived(m, premium))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getInterested(Long profileId) {
        Profile profile = getProfileOrThrow(profileId);
        boolean premium = profile.hasActivePremium();
        return matchRepo.findByReceiverProfileAndStatus(profile, Match.Status.PENDING)
                .stream()
                .map(m -> MatchDTO.fromReceived(m, premium))
                .toList();
    }

    @Transactional
    public MatchDTO sendConnect(Long senderProfileId, Long receiverProfileId) {
        if (senderProfileId.equals(receiverProfileId)) {
            throw new IllegalArgumentException("You can't connect with yourself");
        }
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);
        boolean premium = sender.hasActivePremium();

        // They already asked us — connecting back makes it a match
        var reverse = matchRepo.findBySenderProfileAndReceiverProfile(receiver, sender);
        if (reverse.isPresent() && reverse.get().getStatus() == Match.Status.PENDING) {
            Match m = reverse.get();
            m.setStatus(Match.Status.ACCEPTED);
            return MatchDTO.fromReceived(matchRepo.save(m), premium);
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
        return MatchDTO.fromSent(matchRepo.save(match), premium);
    }

    @Transactional
    public MatchDTO shortlist(Long senderProfileId, Long receiverProfileId) {
        if (senderProfileId.equals(receiverProfileId)) {
            throw new IllegalArgumentException("You can't shortlist yourself");
        }
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);
        boolean premium = sender.hasActivePremium();

        Match match = matchRepo.findBySenderProfileAndReceiverProfile(sender, receiver)
                .orElse(Match.builder().senderProfile(sender).receiverProfile(receiver).build());
        // Never downgrade a sent request or an accepted match to a shortlist entry
        if (match.getId() == null) {
            match.setStatus(Match.Status.SHORTLISTED);
            match = matchRepo.save(match);
        }
        return MatchDTO.fromSent(match, premium);
    }

    @Transactional
    public MatchDTO accept(Long matchId, Long callerProfileId) {
        Match match = matchRepo.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match", matchId));
        // IDOR: only the receiver may accept
        if (!match.getReceiverProfile().getId().equals(callerProfileId)) {
            throw new AccessDeniedException("Not authorized to accept this match");
        }
        match.setStatus(Match.Status.ACCEPTED);
        return MatchDTO.fromReceived(matchRepo.save(match), match.getReceiverProfile().hasActivePremium());
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
        return MatchDTO.fromReceived(matchRepo.save(match), match.getReceiverProfile().hasActivePremium());
    }

    private Profile getProfileOrThrow(Long id) {
        return profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }
}
