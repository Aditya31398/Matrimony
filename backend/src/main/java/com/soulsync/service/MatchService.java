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
        return matchRepo.findAcceptedMatches(profile)
                .stream()
                .map(m -> m.getSenderProfile().getId().equals(profileId)
                        ? MatchDTO.fromSent(m)
                        : MatchDTO.fromReceived(m))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchDTO> getInterested(Long profileId) {
        Profile profile = getProfileOrThrow(profileId);
        return matchRepo.findByReceiverProfileAndStatus(profile, Match.Status.PENDING)
                .stream()
                .map(MatchDTO::fromReceived)
                .toList();
    }

    @Transactional
    public MatchDTO sendConnect(Long senderProfileId, Long receiverProfileId) {
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);

        matchRepo.findBySenderProfileAndReceiverProfile(sender, receiver).ifPresent(m -> {
            throw new IllegalArgumentException("Connection request already sent");
        });

        Match match = Match.builder()
                .senderProfile(sender)
                .receiverProfile(receiver)
                .status(Match.Status.PENDING)
                .build();
        return MatchDTO.fromSent(matchRepo.save(match));
    }

    @Transactional
    public MatchDTO shortlist(Long senderProfileId, Long receiverProfileId) {
        Profile sender = getProfileOrThrow(senderProfileId);
        Profile receiver = getProfileOrThrow(receiverProfileId);

        Match match = matchRepo.findBySenderProfileAndReceiverProfile(sender, receiver)
                .orElse(Match.builder().senderProfile(sender).receiverProfile(receiver).build());
        match.setStatus(Match.Status.SHORTLISTED);
        return MatchDTO.fromSent(matchRepo.save(match));
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
        return MatchDTO.fromReceived(matchRepo.save(match));
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
        return MatchDTO.fromReceived(matchRepo.save(match));
    }

    private Profile getProfileOrThrow(Long id) {
        return profileRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }
}
