package com.soulsync.controller;

import com.soulsync.astrology.CompatibilityResult;
import com.soulsync.astrology.CompatibilityService;
import com.soulsync.exception.PremiumRequiredException;
import com.soulsync.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compatibility")
@RequiredArgsConstructor
public class CompatibilityController {

    private final CompatibilityService compatibilityService;
    private final ProfileService profileService;

    /**
     * GET /api/compatibility/{targetProfileId}
     * Returns horoscope compatibility between the logged-in user and the target profile.
     */
    @GetMapping("/{targetProfileId}")
    public ResponseEntity<CompatibilityResult> getCompatibility(
            @PathVariable Long targetProfileId,
            HttpServletRequest request) {
        Long myProfileId = (Long) request.getAttribute("profileId");
        if (myProfileId == null) return ResponseEntity.status(401).build();
        if (!profileService.isPremium(myProfileId)) {
            throw new PremiumRequiredException("Upgrade to Premium to check horoscope compatibility");
        }
        CompatibilityResult result = compatibilityService.compute(myProfileId, targetProfileId);
        return ResponseEntity.ok(result);
    }
}
