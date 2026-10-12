package com.soulsync.astrology;

import java.util.ArrayList;
import java.util.List;

/**
 * South-Indian Dashakoota (10 poruthams).
 * Pass/fail system: each porutham either passes or fails.
 * Rajju is a dealbreaker — incompatible Rajju = no match.
 * Min passing poruthams for recommendation: 7/10 (some traditions: 6/10).
 */
public class DashakootaMatcher {

    public CompatibilityResult match(int nakGroom, int rashiGroom,
                                     int nakBride,  int rashiBride,
                                     boolean groomManglik, boolean brideManglik) {
        List<KootaScore> poruthams = new ArrayList<>();

        // 1. Dinam (Star compatibility) — Tara-based, 3 pts
        int tara = taraNumber(nakBride, nakGroom);
        boolean dinamPass = tara % 9 != 1 && isTaraGood(tara);   // Janma (1) and 3/5/7 are unfavourable
        poruthams.add(new KootaScore("Dinam", dinamPass ? 1 : 0, 1,
                "Tara " + tara + " from bride to groom — " + (dinamPass ? "auspicious" : "inauspicious")));

        // 2. Ganam (Gana/temperament)
        int ganaG = NakshatraData.GANA[nakGroom-1];
        int ganaB = NakshatraData.GANA[nakBride-1];
        boolean ganamPass = ganamCheck(ganaB, ganaG); // bride gana to groom gana
        poruthams.add(new KootaScore("Ganam", ganamPass ? 1 : 0, 1,
                NakshatraData.ganaName(nakBride) + " (bride) × " + NakshatraData.ganaName(nakGroom) + " (groom)"));

        // 3. Mahendram (groom's star from bride's, should be 4th,7th,10th,13th,16th,19th,22nd,25th)
        int groomStarFromBride = ((nakGroom - nakBride + 27) % 27) + 1;
        boolean mahendramPass = isMahendramGood(groomStarFromBride);
        poruthams.add(new KootaScore("Mahendram", mahendramPass ? 1 : 0, 1,
                "Groom star is " + ordinal(groomStarFromBride) + " from bride — " + (mahendramPass ? "pass" : "fail")));

        // 4. Stree Dheerga (bride's long life) — bride star should be 9+ from groom
        int brideStarFromGroom = ((nakBride - nakGroom + 27) % 27) + 1;
        boolean streeDheergaPass = brideStarFromGroom >= 9;
        poruthams.add(new KootaScore("Stree Dheerga", streeDheergaPass ? 1 : 0, 1,
                "Bride star is " + ordinal(brideStarFromGroom) + " from groom — " + (streeDheergaPass ? "pass" : "fail")));

        // 5. Yoni (sexual compatibility)
        int yoniG = NakshatraData.YONI[nakGroom-1];
        int yoniB = NakshatraData.YONI[nakBride-1];
        boolean yoniPass = !NakshatraData.areYoniEnemies(yoniG, yoniB);
        poruthams.add(new KootaScore("Yoni", yoniPass ? 1 : 0, 1,
                yoniName(yoniB) + " (bride) × " + yoniName(yoniG) + " (groom)"));

        // 6. Rasi (Rashi compatibility)
        boolean rasiPass = rasiCheck(rashiBride, rashiGroom);
        poruthams.add(new KootaScore("Rasi", rasiPass ? 1 : 0, 1,
                NakshatraData.rashiName(rashiBride) + " × " + NakshatraData.rashiName(rashiGroom)));

        // 7. Rasiyathipati (Rashi lord friendship)
        int lordG = NakshatraData.RASHI_LORD[rashiGroom];
        int lordB = NakshatraData.RASHI_LORD[rashiBride];
        boolean rasiyathipatiPass = (NakshatraData.planetaryRelation(lordB, lordG) >= 1);
        poruthams.add(new KootaScore("Rasiyathipati", rasiyathipatiPass ? 1 : 0, 1,
                planetName(lordB) + " × " + planetName(lordG)));

        // 8. Rajju — DEALBREAKER (same Rajju = death/widowhood in tradition)
        int rajjuG = NakshatraData.RAJJU[nakGroom-1];
        int rajjuB = NakshatraData.RAJJU[nakBride-1];
        boolean rajjuDosha = (rajjuG == rajjuB);
        poruthams.add(new KootaScore("Rajju", rajjuDosha ? 0 : 1, 1,
                rajjuDosha ? "Rajju Dosha (" + rajjuName(rajjuG) + ") — dealbreaker"
                           : rajjuName(rajjuB) + " × " + rajjuName(rajjuG)));

        // 9. Vedham (forbidden pairs of nakshatras)
        boolean vedhPass = !isVedhaPair(nakBride, nakGroom);
        poruthams.add(new KootaScore("Vedham", vedhPass ? 1 : 0, 1,
                vedhPass ? "No Vedha conflict" : "Vedha pair conflict"));

        // 10. Nadi
        boolean nadiDosha = NakshatraData.nadi(nakGroom) == NakshatraData.nadi(nakBride);
        poruthams.add(new KootaScore("Nadi", nadiDosha ? 0 : 1, 1,
                nadiDosha ? "Nadi Dosha (" + NakshatraData.nadiName(nakGroom) + ")"
                          : NakshatraData.nadiName(nakBride) + " × " + NakshatraData.nadiName(nakGroom)));

        long passed = poruthams.stream().mapToLong(k -> (long) k.scored()).sum();
        int max = 10;
        int pct = (int) (passed * 100 / max);

        boolean manglikDosha = groomManglik != brideManglik;
        String tier = tier(passed, rajjuDosha);
        String summary = buildSummary(passed, rajjuDosha, nadiDosha, manglikDosha);

        return new CompatibilityResult(passed, max, pct, "DASHAKOOTA", tier, summary,
                nadiDosha, manglikDosha, rajjuDosha, poruthams);
    }

    // ── Porutham logic ────────────────────────────────────────────────────────

    private int taraNumber(int source, int target) {
        return ((target - source + 27) % 27) + 1;
    }

    private boolean isTaraGood(int tara) {
        int taraIdx = (tara - 1) % 9; // 0-8
        return taraIdx != 2 && taraIdx != 4 && taraIdx != 6; // not Vipat(3rd),Pratyak(5th),Naidhana(7th)
    }

    private boolean ganamCheck(int bridGana, int groomGana) {
        if (bridGana == groomGana) return true;
        if (bridGana == 0 && groomGana == 1) return true; // Deva bride, Manushya groom = ok
        if (bridGana == 1 && groomGana == 0) return true; // Manushya bride, Deva groom = ok
        return false; // anything with Rakshasa is bad
    }

    private boolean isMahendramGood(int pos) {
        return pos == 4 || pos == 7 || pos == 10 || pos == 13
            || pos == 16 || pos == 19 || pos == 22 || pos == 25;
    }

    private boolean rasiCheck(int rashiBride, int rashiGroom) {
        int fwd = ((rashiGroom - rashiBride + 12) % 12) + 1; // 1..12
        // Bad: 6th(6/8 pair) or 2nd/12th
        return !(fwd == 2 || fwd == 12 || fwd == 6 || fwd == 8);
    }

    // Vedha (affliction) pairs of nakshatras — traditional 13 pairs
    private static final int[][] VEDHA_PAIRS = {
        {1,18},{2,17},{3,16},{4,15},{5,23},{6,22},{7,21},{8,20},
        {9,19},{10,27},{11,26},{12,25},{13,24}
    };

    private boolean isVedhaPair(int n1, int n2) {
        for (int[] p : VEDHA_PAIRS) {
            if ((p[0] == n1 && p[1] == n2) || (p[1] == n1 && p[0] == n2)) return true;
        }
        return false;
    }

    private String tier(long passed, boolean rajjuDosha) {
        if (rajjuDosha) return "INCOMPATIBLE"; // Rajju is a dealbreaker
        if (passed >= 9)  return "EXCELLENT";
        if (passed >= 7)  return "GOOD";
        if (passed >= 5)  return "AVERAGE";
        if (passed >= 3)  return "POOR";
        return "INCOMPATIBLE";
    }

    private String buildSummary(long passed, boolean rajjuDosha, boolean nadiDosha, boolean manglikDosha) {
        if (rajjuDosha) return "Rajju Dosha present — traditionally considered incompatible for marriage. Consult a Jyotishi for remedies.";
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%d/10 poruthams pass — ", passed));
        sb.append(switch ((int) Long.compare(passed, 7)) {
            case 1  -> "excellent compatibility.";
            case 0  -> "good compatibility.";
            default -> passed >= 5 ? "average compatibility; missing poruthams need attention."
                                   : "below recommended threshold (7/10).";
        });
        if (nadiDosha) sb.append(" Nadi Dosha present.");
        if (manglikDosha) sb.append(" Manglik mismatch — remedies advised.");
        return sb.toString();
    }

    private String ordinal(int n) {
        return n + switch (n % 10 == 1 && n != 11 ? 1 : n % 10 == 2 && n != 12 ? 2 : n % 10 == 3 && n != 13 ? 3 : 0) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };
    }

    private String yoniName(int y) {
        return new String[]{"Horse","Elephant","Sheep","Serpent","Dog","Cat","Rat",
                "Cow","Buffalo","Tiger","Deer","Monkey","Mongoose","Lion"}[y];
    }

    private String planetName(int p) {
        return new String[]{"","Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"}[p];
    }

    private String rajjuName(int r) {
        return new String[]{"Pada (Feet)","Kati (Waist)","Nabhi (Navel)","Kantha (Neck)","Siro (Head)"}[r];
    }
}
