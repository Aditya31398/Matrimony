package com.soulsync.service;

import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.repository.BlockRepository;
import com.soulsync.repository.MatchRepository;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class ViewerContextService {

    private final ProfileRepository profileRepo;
    private final MatchRepository matchRepo;
    private final BlockRepository blockRepo;

    @Transactional(readOnly = true)
    public ViewerContext forProfile(Long profileId) {
        var viewer = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));
        return new ViewerContext(
                viewer,
                viewer.hasActivePremium(),
                new HashSet<>(matchRepo.findConnectedIds(profileId)),
                new HashSet<>(blockRepo.findHiddenIds(profileId)));
    }
}
