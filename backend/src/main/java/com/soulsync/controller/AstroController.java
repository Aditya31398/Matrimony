package com.soulsync.controller;

import com.soulsync.astrology.CompatibilityService;
import com.soulsync.exception.PremiumRequiredException;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.service.AstrologyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/astro")
@RequiredArgsConstructor
public class AstroController {

    private final AstrologyService astrologyService;
    private final CompatibilityService compatibilityService;
    private final ProfileRepository profileRepo;

    /** Star and rashi names the profile forms offer. */
    @GetMapping("/options")
    public ResponseEntity<Map<String, Object>> options() {
        return ResponseEntity.ok(Map.of(
                "nakshatras", AstrologyService.NAKSHATRAS,
                "rashis", AstrologyService.RASHIS));
    }

    /** Guna Milan between the caller and another profile — a premium feature. */
    @GetMapping("/match/{profileId}")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> match(
            @PathVariable Long profileId,
            HttpServletRequest request) {
        Long myId = (Long) request.getAttribute("profileId");
        if (myId == null) throw new IllegalStateException("No authenticated profile in request");
        if (myId.equals(profileId)) throw new IllegalArgumentException("Pick someone else to match with");

        Profile me = profileRepo.findById(myId).orElseThrow(() -> new ResourceNotFoundException("Profile", myId));
        Profile other = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));
        if (!me.hasActivePremium()) {
            throw new PremiumRequiredException("Upgrade to Premium to check astrological compatibility");
        }

        List<String> missing = new java.util.ArrayList<>();
        if (me.getNakshatra() == null || me.getRashi() == null) missing.add("you");
        if (other.getNakshatra() == null || other.getRashi() == null) missing.add(other.getFirstName());
        if (!missing.isEmpty()) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("available", false);
            resp.put("missingFor", missing);
            resp.put("myDetailsMissing", missing.contains("you"));
            return ResponseEntity.ok(resp);
        }

        // Koota tables are defined bride → groom; a woman viewing a man's profile is the bride
        boolean meIsBride = me.getGender() == Profile.Gender.FEMALE || other.getGender() == Profile.Gender.MALE;
        Profile bride = meIsBride ? me : other;
        Profile groom = meIsBride ? other : me;
        var result = astrologyService.match(bride.getNakshatra(), bride.getRashi(),
                groom.getNakshatra(), groom.getRashi());

        Map<String, Object> resp = new HashMap<>();
        resp.put("available", true);
        resp.put("total", result.total());
        resp.put("max", result.max());
        resp.put("verdict", result.verdict());
        resp.put("kootas", result.kootas());
        resp.put("doshas", result.doshas());
        resp.put("bride", Map.of("name", bride.getFirstName(), "nakshatra", bride.getNakshatra(), "rashi", bride.getRashi()));
        resp.put("groom", Map.of("name", groom.getFirstName(), "nakshatra", groom.getNakshatra(), "rashi", groom.getRashi()));
        // Richer, tradition-aware result: Ashtakoota/Dashakoota per language, advisories, alternate system
        resp.put("advanced", compatibilityService.compute(me, other));
        return ResponseEntity.ok(resp);
    }
}
