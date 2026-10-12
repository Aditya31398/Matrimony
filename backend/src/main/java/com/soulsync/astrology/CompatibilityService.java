package com.soulsync.astrology;

import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Profile;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompatibilityService {

    private final ProfileRepository profileRepo;

    private final AshtakootaMatcher ashtakoota = new AshtakootaMatcher();
    private final DashakootaMatcher dashakoota  = new DashakootaMatcher();
    private final BasicZodiacMatcher basicZodiac = new BasicZodiacMatcher();

    @Transactional(readOnly = true)
    public CompatibilityResult compute(Long profileId1, Long profileId2) {
        Profile p1 = profileRepo.findById(profileId1)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId1));
        Profile p2 = profileRepo.findById(profileId2)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId2));

        return compute(p1, p2);
    }

    public CompatibilityResult compute(Profile p1, Profile p2) {
        if (p1.getNakshatra() == null || p2.getNakshatra() == null) {
            return CompatibilityResult.insufficient(
                    "Nakshatra not set for one or both profiles. " +
                    "Please add your birth star (nakshatra) in Edit Profile to see a detailed match score.");
        }

        // Resolve rashi from nakshatra if not explicitly set
        int rashi1 = resolveRashi(p1);
        int rashi2 = resolveRashi(p2);
        boolean m1 = Boolean.TRUE.equals(p1.getIsManglik());
        boolean m2 = Boolean.TRUE.equals(p2.getIsManglik());

        // Choose algorithm based on religion + motherTongue
        String algorithm = selectAlgorithm(p1, p2);

        // Asymmetric kootas need groom/bride roles: the male profile is the groom.
        // (Same-gender or unspecified pairs keep p1 as groom.)
        if (p1.getGender() == Profile.Gender.FEMALE && p2.getGender() == Profile.Gender.MALE) {
            Profile t = p1; p1 = p2; p2 = t;
            int tr = rashi1; rashi1 = rashi2; rashi2 = tr;
            boolean tm = m1; m1 = m2; m2 = tm;
        }

        return switch (algorithm) {
            case "DASHAKOOTA" -> dashakoota.match(p1.getNakshatra(), rashi1,
                                                   p2.getNakshatra(), rashi2, m1, m2);
            case "ASHTAKOOTA" -> ashtakoota.match(p1.getNakshatra(), rashi1,
                                                   p2.getNakshatra(), rashi2, m1, m2);
            default           -> basicZodiac.match(p1.getNakshatra(), rashi1,
                                                   p2.getNakshatra(), rashi2, m1, m2);
        };
    }

    private int resolveRashi(Profile p) {
        if (p.getRashi() != null) return p.getRashi();
        return NakshatraData.RASHI[p.getNakshatra() - 1];
    }

    /**
     * Selects the matching algorithm based on religion and mother tongue.
     * South Indian religions / Dravidian languages → Dashakoota.
     * North Indian / Vedic → Ashtakoota.
     * Non-Hindu or unknown → Basic Zodiac.
     */
    private String selectAlgorithm(Profile p1, Profile p2) {
        String rel1 = lower(p1.getReligion());
        String rel2 = lower(p2.getReligion());
        String lang1 = lower(p1.getMotherTongue());
        String lang2 = lower(p2.getMotherTongue());

        // Non-Hindu religions get the basic zodiac matcher
        boolean nonHindu1 = isNonHindu(rel1);
        boolean nonHindu2 = isNonHindu(rel2);
        if (nonHindu1 || nonHindu2) return "BASIC_ZODIAC";

        // South Indian languages → Dashakoota
        boolean southIndian = isSouthIndianLang(lang1) || isSouthIndianLang(lang2);
        if (southIndian) return "DASHAKOOTA";

        // Default for Hindu profiles → Ashtakoota
        return "ASHTAKOOTA";
    }

    private boolean isNonHindu(String rel) {
        if (rel == null) return false;
        return rel.contains("muslim") || rel.contains("christian") || rel.contains("parsi")
            || rel.contains("jewish") || rel.contains("no religion");
    }

    private boolean isSouthIndianLang(String lang) {
        if (lang == null) return false;
        return lang.contains("tamil") || lang.contains("telugu")
            || lang.contains("kannada") || lang.contains("malayalam");
    }

    private String lower(String s) {
        return s == null ? "" : s.toLowerCase();
    }
}
