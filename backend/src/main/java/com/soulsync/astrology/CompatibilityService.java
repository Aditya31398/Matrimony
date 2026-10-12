package com.soulsync.astrology;

import com.soulsync.astrology.LanguageRules.Algo;
import com.soulsync.astrology.LanguageRules.Rule;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CompatibilityService {

    private final ProfileRepository profileRepo;

    private final AshtakootaMatcher ashtakoota = new AshtakootaMatcher();
    private final DashakootaMatcher dashakoota  = new DashakootaMatcher();
    private final BasicZodiacMatcher basicZodiac = new BasicZodiacMatcher();

    enum Region { SOUTH, EAST, WEST, NORTH }

    private static final List<String> SOUTH_LANGS = List.of("tamil", "telugu", "kannada", "malayalam", "tulu");
    private static final List<String> EAST_LANGS  = List.of("bengali", "bangla", "odia", "oriya", "assamese");
    private static final List<String> WEST_LANGS  = List.of("marathi", "gujarati", "konkani");

    // Religions whose matching tradition does not use the Vedic Gun Milan / Porutham systems.
    private static final List<String> BASIC_ONLY_RELIGIONS =
            List.of("muslim", "christian", "sikh", "parsi", "jewish", "no religion");

    @Transactional(readOnly = true)
    public CompatibilityResult compute(Long profileId1, Long profileId2) {
        Profile p1 = profileRepo.findById(profileId1)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId1));
        Profile p2 = profileRepo.findById(profileId2)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId2));
        return compute(p1, p2);
    }

    public CompatibilityResult compute(Profile p1, Profile p2) {
        if (NakshatraData.nakshatraIndex(p1.getNakshatra()) == 0
                || NakshatraData.nakshatraIndex(p2.getNakshatra()) == 0) {
            return CompatibilityResult.insufficient(
                    "Nakshatra not set for one or both profiles. " +
                    "Please add your birth star (nakshatra) in Edit Profile to see a detailed match score.");
        }

        // Asymmetric kootas need groom/bride roles: the male profile is the groom.
        // (Same-gender or unspecified pairs keep p1 as groom.)
        if (p1.getGender() == Profile.Gender.FEMALE && p2.getGender() == Profile.Gender.MALE) {
            Profile t = p1; p1 = p2; p2 = t;
        }
        Profile groom = p1, bride = p2;
        int nakG = NakshatraData.nakshatraIndex(groom.getNakshatra());
        int nakB = NakshatraData.nakshatraIndex(bride.getNakshatra());
        int rashiG = resolveRashi(groom), rashiB = resolveRashi(bride);
        boolean mG = Boolean.TRUE.equals(groom.getIsManglik());
        boolean mB = Boolean.TRUE.equals(bride.getIsManglik());

        Region r1 = regionOf(groom), r2 = regionOf(bride);
        String regionLabel = r1 == r2 ? r1.name() : r1 + "/" + r2;

        if (isBasicOnly(groom) || isBasicOnly(bride)) {
            return basicZodiac.match(nakG, rashiG, nakB, rashiB, mG, mB)
                    .withRegion(regionLabel, null)
                    .withAdvisories(List.of(
                        "Horoscope matching is not part of this tradition; this star-based score is informational only."));
        }

        Rule gRule = LanguageRules.forMotherTongue(groom.getMotherTongue());
        Rule bRule = LanguageRules.forMotherTongue(bride.getMotherTongue());

        // Decide primary / alternate algorithm
        Algo gOverride = override(groom), bOverride = override(bride);
        Algo primary;
        Algo alternate = null;
        List<String> advisories = new ArrayList<>();

        if (gOverride != null || bOverride != null) {
            if (gOverride != null && bOverride != null && gOverride != bOverride) {
                primary = Algo.DASHAKOOTA;           // families disagree: show both
                alternate = Algo.ASHTAKOOTA;
                advisories.add("The two profiles follow different traditions, so both systems are shown.");
            } else {
                primary = gOverride != null ? gOverride : bOverride;
                advisories.add("Using the tradition selected in the profile ("
                        + (primary == Algo.DASHAKOOTA ? "Porutham / Dashakoota" : "Gun Milan / Ashtakoota") + ").");
            }
        } else if (gRule.primary() == bRule.primary()) {
            primary = gRule.primary();
            alternate = firstNonNull(gRule.alsoShow(), bRule.alsoShow());
        } else {
            // Mixed languages: the Porutham tradition is the stricter, so it leads.
            primary = Algo.DASHAKOOTA;
            alternate = Algo.ASHTAKOOTA;
        }
        if (alternate == primary) alternate = null;

        // Language notes (de-duplicated, groom then bride)
        Set<String> notes = new LinkedHashSet<>();
        if (gRule.note() != null) notes.add(gRule.note());
        if (bRule.note() != null) notes.add(bRule.note());
        advisories.addAll(notes);

        // Papasamyam (Kerala practice)
        if (gRule.papasamyam() || bRule.papasamyam()) {
            advisories.add(papasamyam(groom.getPapaPoints(), bride.getPapaPoints()));
        }

        CompatibilityResult main = run(primary, nakG, rashiG, nakB, rashiB, mG, mB);
        CompatibilityResult alt = alternate == null ? null
                : run(alternate, nakG, rashiG, nakB, rashiB, mG, mB);
        return main.withRegion(regionLabel, alt).withAdvisories(advisories);
    }

    private CompatibilityResult run(Algo a, int nakG, int rashiG, int nakB, int rashiB, boolean mG, boolean mB) {
        return a == Algo.DASHAKOOTA
                ? dashakoota.match(nakG, rashiG, nakB, rashiB, mG, mB)
                : ashtakoota.match(nakG, rashiG, nakB, rashiB, mG, mB);
    }

    /**
     * Simplified Papasamyam: compares the malefic-planet points on each horoscope.
     * Traditional practice asks that the totals be close, with the groom's not lower
     * than the bride's. Points are entered by the user from their jathakam.
     */
    static String papasamyam(Integer groomPts, Integer bridePts) {
        if (groomPts == null || bridePts == null) {
            return "Papasamyam: not evaluated. Add papa points from the jathakam in Edit Profile.";
        }
        int diff = groomPts - bridePts;
        if (diff >= 0 && diff <= 1) {
            return "Papasamyam: balanced (groom " + groomPts + ", bride " + bridePts + ").";
        }
        if (diff < 0) {
            return "Papasamyam: the bride's papa points (" + bridePts + ") exceed the groom's (" + groomPts
                    + "), which is traditionally considered unfavourable. Consult an astrologer.";
        }
        return "Papasamyam: the groom's papa points (" + groomPts + ") are well above the bride's ("
                + bridePts + "), an imbalance. Consult an astrologer.";
    }

    private static Algo override(Profile p) {
        String t = p.getMatchingTradition();
        if (t == null) return null;
        return switch (t.toUpperCase()) {
            case "DASHAKOOTA" -> Algo.DASHAKOOTA;
            case "ASHTAKOOTA" -> Algo.ASHTAKOOTA;
            default -> null;
        };
    }

    private static Algo firstNonNull(Algo a, Algo b) { return a != null ? a : b; }

    private int resolveRashi(Profile p) {
        int r = NakshatraData.rashiIndex(p.getRashi());
        if (r > 0) return r;
        return NakshatraData.RASHI[NakshatraData.nakshatraIndex(p.getNakshatra()) - 1];
    }

    private boolean isBasicOnly(Profile p) {
        String rel = lower(p.getReligion());
        return BASIC_ONLY_RELIGIONS.stream().anyMatch(rel::contains);
    }

    /** A South Indian language anywhere in a multi-language value wins; otherwise first match. */
    static Region regionOf(Profile p) {
        String langs = lower(p.getMotherTongue());
        if (SOUTH_LANGS.stream().anyMatch(langs::contains)) return Region.SOUTH;
        if (EAST_LANGS.stream().anyMatch(langs::contains))  return Region.EAST;
        if (WEST_LANGS.stream().anyMatch(langs::contains))  return Region.WEST;
        return Region.NORTH;
    }

    private static String lower(String s) {
        return s == null ? "" : s.toLowerCase();
    }
}
