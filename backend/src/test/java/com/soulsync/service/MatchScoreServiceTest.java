package com.soulsync.service;

import com.soulsync.astrology.CompatibilityService;
import com.soulsync.model.Profile;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class MatchScoreServiceTest {

    private final MatchScoreService service = new MatchScoreService(mock(CompatibilityService.class));

    private static Profile profile(long id, int age, String religion, String tongue, String city, String interests) {
        return Profile.builder().id(id).firstName("P" + id)
                .dateOfBirth(LocalDate.now().minusYears(age).minusDays(1))
                .religion(religion).motherTongue(tongue).city(city).interests(interests)
                .ageMin(24).ageMax(32).build();
    }

    private static ViewerContext ctx(Profile viewer, boolean premium) {
        return new ViewerContext(viewer, premium, Set.of(), Set.of());
    }

    @Test
    void identicalPreferencesScoreHigh() {
        Profile me = profile(1, 28, "Hindu", "Telugu", "Pune", "Music,Travel,Books");
        Profile them = profile(2, 27, "Hindu", "Telugu", "Pune", "Music,Travel,Books");
        assertEquals(100, service.score(ctx(me, true), them).percent());
    }

    @Test
    void mismatchesLowerTheScore() {
        Profile me = profile(1, 28, "Hindu", "Telugu", "Pune", "Music");
        Profile them = profile(2, 40, "Christian", "Hindi", "Delhi", "Cricket");
        Integer score = service.score(ctx(me, true), them).percent();
        assertNotNull(score);
        assertTrue(score < 20, "score was " + score);
    }

    @Test
    void freeViewersDontSeePremiumDetailsInTheBreakdown() {
        Profile me = profile(1, 28, "Hindu", "Telugu", "Pune", "Music");
        Profile them = profile(2, 27, "Hindu", "Telugu", "Pune", "Music");
        var factors = service.score(ctx(me, false), them).factors();
        assertTrue(factors.stream().noneMatch(f -> f.label().contains("Pune") || f.label().contains("Telugu")
                || f.label().contains("Music")));
        assertTrue(factors.stream().anyMatch(f -> f.locked() && f.label().equals("Location")));
    }

    @Test
    void tooLittleDataGivesNoPercentage() {
        Profile me = Profile.builder().id(1L).firstName("A").build();
        Profile them = Profile.builder().id(2L).firstName("B").build();
        assertNull(service.score(ctx(me, true), them).percent());
    }
}
