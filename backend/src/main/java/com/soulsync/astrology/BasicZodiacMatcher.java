package com.soulsync.astrology;

import java.util.ArrayList;
import java.util.List;

/**
 * Free-tier matcher: uses only Rashi (moon sign) and Nakshatra.
 * No birth time or full chart required. Score out of 10.
 */
public class BasicZodiacMatcher {

    public CompatibilityResult match(int nak1, int rashi1, int nak2, int rashi2,
                                     boolean m1Manglik, boolean m2Manglik) {
        List<KootaScore> scores = new ArrayList<>();

        // 1. Nadi check (3 pts) — same nadi is a major defect
        int nadi1 = NakshatraData.nadi(nak1);
        int nadi2 = NakshatraData.nadi(nak2);
        boolean nadiDosha = (nadi1 == nadi2);
        double nadiPts = nadiDosha ? 0 : 3;
        scores.add(new KootaScore("Nadi", nadiPts, 3,
                nadiDosha ? "Nadi Dosha — same " + NakshatraData.nadiName(nak1) + " nadi"
                          : NakshatraData.nadiName(nak1) + " × " + NakshatraData.nadiName(nak2)));

        // 2. Gana check (3 pts)
        int gana1 = NakshatraData.GANA[nak1 - 1];
        int gana2 = NakshatraData.GANA[nak2 - 1];
        double ganaPts = ganaScore(gana1, gana2);
        scores.add(new KootaScore("Gana", ganaPts, 3,
                NakshatraData.ganaName(nak1) + " × " + NakshatraData.ganaName(nak2)));

        // 3. Rashi element compatibility (2 pts)
        int el1 = NakshatraData.rashiElement(rashi1);
        int el2 = NakshatraData.rashiElement(rashi2);
        double rashiPts = rashiElementScore(el1, el2);
        scores.add(new KootaScore("Rashi", rashiPts, 2,
                NakshatraData.rashiName(rashi1) + " × " + NakshatraData.rashiName(rashi2)));

        // 4. Nakshatra distance (2 pts)
        double distPts = nakshatraDistanceScore(nak1, nak2);
        scores.add(new KootaScore("Nakshatra", distPts, 2,
                NakshatraData.NAMES[nak1 - 1] + " × " + NakshatraData.NAMES[nak2 - 1]));

        double total = nadiPts + ganaPts + rashiPts + distPts;
        int max = 10;
        int pct = (int) Math.round(total / max * 100);

        // Manglik adjustment — advisory only in basic tier
        boolean manglikMismatch = m1Manglik != m2Manglik;
        if (manglikMismatch) {
            total = Math.max(0, total - 1);
        }

        String tier = tier(pct);
        String summary = buildSummary(tier, nadiDosha, manglikMismatch);

        return new CompatibilityResult(total, max, (int) Math.round(total / max * 100),
                "BASIC_ZODIAC", tier, summary, nadiDosha, manglikMismatch, false, scores);
    }

    private double ganaScore(int g1, int g2) {
        if (g1 == g2) return 3;                               // same gana
        if ((g1 == 0 && g2 == 1) || (g1 == 1 && g2 == 0)) return 2; // Deva-Manushya
        return 0;                                              // Rakshasa mix
    }

    private double rashiElementScore(int e1, int e2) {
        if (e1 == e2) return 2;   // same element
        // Compatible pairs: Fire+Air(0+2), Earth+Water(1+3)
        if ((e1 == 0 && e2 == 2) || (e1 == 2 && e2 == 0)) return 1.5;
        if ((e1 == 1 && e2 == 3) || (e1 == 3 && e2 == 1)) return 1.5;
        return 0.5;
    }

    private double nakshatraDistanceScore(int n1, int n2) {
        int fwd = ((n2 - n1 + 27) % 27) + 1; // 1..27
        int bwd = ((n1 - n2 + 27) % 27) + 1;
        // Auspicious placements: 1/1, 3/11, 4/10, 5/9, 6/8 (complementary)
        boolean fwdGood = fwd == 1 || fwd == 3 || fwd == 4 || fwd == 5 || fwd == 6 || fwd == 11;
        boolean bwdGood = bwd == 1 || bwd == 3 || bwd == 4 || bwd == 5 || bwd == 6 || bwd == 11;
        if (fwdGood && bwdGood) return 2;
        if (fwdGood || bwdGood) return 1;
        return 0;
    }

    private String tier(int pct) {
        if (pct >= 80) return "EXCELLENT";
        if (pct >= 60) return "GOOD";
        if (pct >= 40) return "AVERAGE";
        if (pct >= 20) return "POOR";
        return "INCOMPATIBLE";
    }

    private String buildSummary(String tier, boolean nadiDosha, boolean manglikMismatch) {
        StringBuilder sb = new StringBuilder();
        sb.append(switch (tier) {
            case "EXCELLENT" -> "Highly compatible — strong cosmic alignment.";
            case "GOOD"      -> "Good compatibility — a promising match.";
            case "AVERAGE"   -> "Moderate compatibility — may need mutual effort.";
            case "POOR"      -> "Low compatibility — challenges may arise.";
            default          -> "Significant incompatibility — careful consideration advised.";
        });
        if (nadiDosha) sb.append(" Nadi Dosha present (same nadi) — consult a priest for remedies.");
        if (manglikMismatch) sb.append(" Manglik mismatch — traditional advice: perform Kumbha Vivah or consult an astrologer.");
        return sb.toString();
    }
}
