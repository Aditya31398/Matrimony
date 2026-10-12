package com.soulsync.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AstrologyServiceTest {

    private final AstrologyService astro = new AstrologyService();

    @Test
    void sameStarAndRashiScores28WithNadiDosha() {
        var r = astro.match("Ashwini", "Mesha", "Ashwini", "Mesha");
        assertEquals(28, r.total());
        assertTrue(r.doshas().contains("Nadi Dosha"));
    }

    @Test
    void sixEightRashiPositionIsBhakootDosha() {
        // Mesha → Kanya is the 6th sign
        var r = astro.match("Ashwini", "Mesha", "Hasta", "Kanya");
        assertTrue(r.doshas().contains("Bhakoot Dosha"));
    }

    @Test
    void everyPairingStaysWithinBounds() {
        for (String bn : AstrologyService.NAKSHATRAS) {
            for (String gn : AstrologyService.NAKSHATRAS) {
                String br = AstrologyService.RASHIS.stream().filter(r -> AstrologyService.isConsistent(bn, r)).findFirst().orElseThrow();
                String gr = AstrologyService.RASHIS.stream().filter(r -> AstrologyService.isConsistent(gn, r)).findFirst().orElseThrow();
                var result = astro.match(bn, br, gn, gr);
                assertTrue(result.total() >= 0 && result.total() <= 36, bn + "/" + gn + " = " + result.total());
                result.kootas().forEach(k -> assertTrue(k.points() <= k.max(), k.name()));
            }
        }
    }

    @Test
    void starsThatStraddleTwoSignsAcceptBoth() {
        assertTrue(AstrologyService.isConsistent("Krittika", "Mesha"));
        assertTrue(AstrologyService.isConsistent("Krittika", "Vrishabha"));
        assertFalse(AstrologyService.isConsistent("Krittika", "Mithuna"));
        assertTrue(AstrologyService.isConsistent("Revati", "Meena"));
    }
}
