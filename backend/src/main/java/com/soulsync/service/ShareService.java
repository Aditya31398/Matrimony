package com.soulsync.service;

import com.soulsync.dto.FamilyViewDTO;
import com.soulsync.dto.ProfileDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.model.ShareLink;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.ShareLinkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;

/** Expiring read-only links so family can review a profile on WhatsApp without an account. */
@Service
@RequiredArgsConstructor
public class ShareService {

    private static final int VALID_DAYS = 7;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final ShareLinkRepository shareRepo;
    private final ProfileRepository profileRepo;
    private final ViewerContextService viewerContextService;
    private final ProfileCardMapper cardMapper;

    @Transactional
    public Map<String, Object> create(Long sharerId, Long profileId) {
        ViewerContext ctx = viewerContextService.forProfile(sharerId);
        if (ctx.isHidden(profileId)) throw new ResourceNotFoundException("Profile", profileId);
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));

        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        ShareLink link = shareRepo.save(ShareLink.builder()
                .token(token)
                .sharer(ctx.viewer())
                .profile(profile)
                .expiresAt(LocalDateTime.now().plusDays(VALID_DAYS))
                .build());
        return Map.of("token", link.getToken(), "expiresAt", link.getExpiresAt().toString());
    }

    @Transactional
    public FamilyViewDTO view(String token) {
        ShareLink link = shareRepo.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Share link", 0L));
        if (link.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("This link has expired. Ask for a new one.");
        }
        ViewerContext ctx = viewerContextService.forProfile(link.getSharer().getId());
        Profile p = link.getProfile();
        if (ctx.isHidden(p.getId())) throw new ResourceNotFoundException("Share link", 0L);
        link.setViewCount(link.getViewCount() + 1);

        // Family sees what the sharer could see
        ProfileDTO d = cardMapper.detail(p, ctx);
        return FamilyViewDTO.builder()
                .firstName(d.getFirstName())
                .lastName(d.getLastName())
                .age(d.getAge())
                .religion(d.getReligion())
                .caste(d.getCaste())
                .motherTongue(d.getMotherTongue())
                .education(d.getEducation())
                .profession(d.getProfession())
                .city(d.getCity())
                .state(d.getState())
                .height(d.getHeight())
                .dietaryPreference(d.getDietaryPreference())
                .bio(d.getBio())
                .interests(d.getInterests())
                .nakshatra(d.getNakshatra())
                .rashi(d.getRashi())
                .photoUrl(d.getPhotoUrl())
                .photoHidden(d.isPhotoHidden())
                .limited(d.isRestricted())
                .sharedBy(link.getSharer().getFirstName())
                .sharedOwnProfile(link.getSharer().getId().equals(p.getId()))
                .expiresAt(link.getExpiresAt())
                .build();
    }
}
