package com.soulsync.service;

import com.soulsync.dto.ProfileDTO;
import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.model.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

/** Applies premium visibility, photo privacy and match score when showing a profile to a viewer. */
@Component
@RequiredArgsConstructor
public class ProfileCardMapper {

    private final MatchScoreService matchScoreService;

    public ProfileSummaryDTO summary(Profile p, ViewerContext ctx) {
        ProfileSummaryDTO dto = ctx.premium() || ctx.isSelf(p) ? ProfileSummaryDTO.from(p) : ProfileSummaryDTO.limited(p);
        if (!ctx.canSeePhotoOf(p)) {
            dto.setPhotoUrl(null);
            dto.setPhotoHidden(true);
        }
        dto.setMatchScore(matchScoreService.score(ctx, p).percent());
        return dto;
    }

    public ProfileDTO detail(Profile p, ViewerContext ctx) {
        boolean self = ctx.isSelf(p);
        ProfileDTO dto = self || ctx.premium() ? ProfileDTO.from(p) : ProfileDTO.limited(p);
        if (self) {
            dto.setPhotoPrivate(Boolean.TRUE.equals(p.getPhotoPrivate()));
        } else if (!ctx.canSeePhotoOf(p)) {
            dto.setPhotoUrl(null);
            dto.setPhotos(List.of());
            dto.setPhotoHidden(true);
        }
        return dto;
    }
}
