package com.soulsync.service;

import com.soulsync.model.Profile;

import java.util.Set;

/**
 * Everything that decides what one member may see of others, loaded once per request:
 * premium status, who they're connected with (for private photos) and who is blocked.
 */
public record ViewerContext(Profile viewer, boolean premium, Set<Long> connectedIds, Set<Long> hiddenIds) {

    public Long viewerId() {
        return viewer == null ? null : viewer.getId();
    }

    public boolean isSelf(Profile p) {
        return viewer != null && viewer.getId().equals(p.getId());
    }

    /** Blocked in either direction. */
    public boolean isHidden(Long profileId) {
        return hiddenIds.contains(profileId);
    }

    public boolean canSeePhotoOf(Profile p) {
        return !Boolean.TRUE.equals(p.getPhotoPrivate()) || isSelf(p) || connectedIds.contains(p.getId());
    }
}
