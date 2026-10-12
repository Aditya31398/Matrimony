package com.soulsync.astrology;

import com.soulsync.model.Profile;
import com.soulsync.model.Profile.Gender;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CompatibilityServiceTest {

    private final CompatibilityService service = new CompatibilityService(null);

    private static Profile p(Gender g, String lang, String nakshatra, String rashi) {
        return Profile.builder().gender(g).religion("Hindu").motherTongue(lang)
                .nakshatra(nakshatra).rashi(rashi).build();
    }

    @Test
    void ashtakootaMatchesHandComputedScore() {
        // Bride Rohini/Vrishabha x groom Ashwini/Mesha: 1+2+1.5+2+3+6+0+8 = 23.5
        CompatibilityResult r = service.compute(
                p(Gender.FEMALE, "Hindi", "Rohini", "Vrishabha"),
                p(Gender.MALE, "Hindi", "Ashwini", "Mesha"));
        assertEquals("ASHTAKOOTA", r.algorithm());
        assertEquals(23.5, r.totalScore(), 0.001);
        assertEquals(36, r.maxScore());
    }

    @Test
    void groomBrideRolesDoNotDependOnWhoIsViewing() {
        Profile f = p(Gender.FEMALE, "Hindi", "Rohini", "Vrishabha");
        Profile m = p(Gender.MALE, "Hindi", "Ashwini", "Mesha");
        assertEquals(service.compute(f, m).totalScore(), service.compute(m, f).totalScore(), 0.001);
    }

    @Test
    void acceptsEnglishRashiNamesAndSpellingVariants() {
        CompatibilityResult r = service.compute(
                p(Gender.FEMALE, "Hindi", "Dhanishtha", "Capricorn"),
                p(Gender.MALE, "Hindi", "Dhanishta", "Makara"));
        assertEquals("ASHTAKOOTA", r.algorithm());
    }

    @Test
    void southIndianLanguagesUseDashakootaAndMixedPairsShowBoth() {
        CompatibilityResult tamil = service.compute(
                p(Gender.FEMALE, "Tamil", "Rohini", "Vrishabha"),
                p(Gender.MALE, "Tamil", "Ashwini", "Mesha"));
        assertEquals("DASHAKOOTA", tamil.algorithm());
        assertNull(tamil.alternate());

        CompatibilityResult mixed = service.compute(
                p(Gender.FEMALE, "Tamil", "Rohini", "Vrishabha"),
                p(Gender.MALE, "Hindi", "Ashwini", "Mesha"));
        assertEquals("DASHAKOOTA", mixed.algorithm());
        assertNotNull(mixed.alternate());
        assertEquals("ASHTAKOOTA", mixed.alternate().algorithm());
    }

    @Test
    void sikhProfilesGetInformationalBasicScore() {
        Profile f = p(Gender.FEMALE, "Punjabi", "Rohini", "Vrishabha");
        f.setReligion("Sikh");
        CompatibilityResult r = service.compute(f, p(Gender.MALE, "Punjabi", "Ashwini", "Mesha"));
        assertEquals("BASIC_ZODIAC", r.algorithm());
    }

    @Test
    void missingStarGivesFriendlyMessageNotAScore() {
        CompatibilityResult r = service.compute(
                p(Gender.FEMALE, "Hindi", null, null),
                p(Gender.MALE, "Hindi", "Ashwini", "Mesha"));
        assertEquals("NONE", r.algorithm());
    }

    @Test
    void keralaPapasamyamAdvisory() {
        Profile f = p(Gender.FEMALE, "Malayalam", "Rohini", "Vrishabha");
        Profile m = p(Gender.MALE, "Malayalam", "Ashwini", "Mesha");
        f.setPapaPoints(6);
        m.setPapaPoints(2);
        CompatibilityResult r = service.compute(f, m);
        assertTrue(r.advisories().stream().anyMatch(a -> a.contains("exceed the groom")));
    }

    @Test
    void nakshatraTablesFollowStandardGrouping() {
        int[] aadi = {1, 6, 7, 12, 13, 18, 19, 24, 25};
        for (int n : aadi) assertEquals(0, NakshatraData.nadi(n), "nakshatra " + n);
        assertEquals(1, NakshatraData.nadi(2));
        assertEquals(2, NakshatraData.nadi(3));
        assertEquals(2, NakshatraData.nadi(4));
    }
}
