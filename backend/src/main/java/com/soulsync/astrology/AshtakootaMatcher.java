package com.soulsync.astrology;

import java.util.ArrayList;
import java.util.List;

/**
 * Full North-Indian Ashtakoota (8 kootas, max 36 points).
 * Requires nakshatra (1-27) and rashi (1-12) for both parties.
 * Groom = profile1, Bride = profile2 (convention for scoring asymmetric kootas).
 */
public class AshtakootaMatcher {

    public CompatibilityResult match(int nakGroom, int rashiGroom,
                                     int nakBride,  int rashiBride,
                                     boolean groomManglik, boolean brideManglik) {
        List<KootaScore> kootas = new ArrayList<>();

        // 1. Varna Koota (1 pt) — groom varna >= bride varna
        int varnaG = NakshatraData.varnaOfRashi(rashiGroom);   // 0 = highest (Brahmin)
        int varnaB = NakshatraData.varnaOfRashi(rashiBride);
        double varna = (varnaG <= varnaB) ? 1 : 0;
        kootas.add(new KootaScore("Varna", varna, 1,
                varnaName(varnaG) + " (groom) × " + varnaName(varnaB) + " (bride)"));

        // 2. Vashya Koota (2 pts) — who controls whom
        double vashya = vashyaScore(rashiGroom, rashiBride);
        kootas.add(new KootaScore("Vashya", vashya, 2,
                NakshatraData.rashiName(rashiGroom) + " × " + NakshatraData.rashiName(rashiBride)));

        // 3. Tara / Dina Koota (3 pts)
        double tara = taraScore(nakBride, nakGroom);
        kootas.add(new KootaScore("Tara", tara, 3,
                NakshatraData.NAMES[nakBride-1] + " → " + NakshatraData.NAMES[nakGroom-1]));

        // 4. Yoni Koota (4 pts)
        int yoniG = NakshatraData.YONI[nakGroom-1];
        int yoniB = NakshatraData.YONI[nakBride-1];
        double yoni = yoniScore(yoniG, yoniB);
        kootas.add(new KootaScore("Yoni", yoni, 4, yoniName(yoniG) + " × " + yoniName(yoniB)));

        // 5. Graha Maitri / Planetary Friendship (5 pts)
        int lordG = NakshatraData.RASHI_LORD[rashiGroom];
        int lordB = NakshatraData.RASHI_LORD[rashiBride];
        double maitri = grahaMaitriScore(lordG, lordB);
        kootas.add(new KootaScore("Graha Maitri", maitri, 5,
                planetName(lordG) + " × " + planetName(lordB)));

        // 6. Gana Koota (6 pts)
        int ganaG = NakshatraData.GANA[nakGroom-1];
        int ganaB = NakshatraData.GANA[nakBride-1];
        double gana = ganaScore(ganaG, ganaB);
        kootas.add(new KootaScore("Gana", gana, 6,
                NakshatraData.ganaName(nakGroom) + " × " + NakshatraData.ganaName(nakBride)));

        // 7. Bhakoot / Rashi Koota (7 pts)
        double bhakoot = bhakootScore(rashiBride, rashiGroom);
        kootas.add(new KootaScore("Bhakoot", bhakoot, 7,
                NakshatraData.rashiName(rashiBride) + " → " + NakshatraData.rashiName(rashiGroom)));

        // 8. Nadi Koota (8 pts) — same nadi = 0 (Nadi Dosha)
        int nadiG = NakshatraData.nadi(nakGroom);
        int nadiB = NakshatraData.nadi(nakBride);
        boolean nadiDosha = (nadiG == nadiB);
        double nadi = nadiDosha ? 0 : 8;
        kootas.add(new KootaScore("Nadi", nadi, 8,
                nadiDosha ? "Nadi Dosha (" + NakshatraData.nadiName(nakGroom) + ")"
                          : NakshatraData.nadiName(nakGroom) + " × " + NakshatraData.nadiName(nakBride)));

        // Rajju Dosha check (advisory, not part of 36-point score)
        boolean rajjuDosha = NakshatraData.RAJJU[nakGroom-1] == NakshatraData.RAJJU[nakBride-1];

        // Manglik
        boolean manglikDosha = groomManglik != brideManglik;

        double total = kootas.stream().mapToDouble(KootaScore::scored).sum();
        int max = 36;
        int pct = (int) Math.round(total / max * 100);
        String tier = tier(total);

        return new CompatibilityResult(total, max, pct, "ASHTAKOOTA", tier,
                buildSummary(total, nadiDosha, rajjuDosha, manglikDosha),
                nadiDosha, manglikDosha, rajjuDosha, kootas);
    }

    // ── Koota scoring helpers ────────────────────────────────────────────────

    // Simplified Vashya matrix over the five vashya groups (CH, MA, JA, VA, KE)
    private static final double[][] VASHYA = {
        //  CH   MA   JA   VA   KE
        {  2,   1,   1,   0.5, 1 },   // Chatushpada
        {  1,   2,   0.5, 0,   1 },   // Manava
        {  1,   0.5, 2,   1,   1 },   // Jalachara
        {  0,   0,   1,   2,   0 },   // Vanachara
        {  1,   1,   1,   0,   2 },   // Keeta
    };

    private double vashyaScore(int rashiG, int rashiB) {
        return VASHYA[NakshatraData.vashyaGroup(rashiB)][NakshatraData.vashyaGroup(rashiG)];
    }

    private double taraScore(int nakBride, int nakGroom) {
        int fwdCount = ((nakGroom - nakBride + 27) % 27) + 1;
        int bwdCount = ((nakBride - nakGroom + 27) % 27) + 1;
        // Tara index 0-8 from any nakshatra: 3rd(Vipat), 5th(Pratyak), 7th(Naidhana) are bad
        boolean fwdBad = isBadTara((fwdCount - 1) % 9);
        boolean bwdBad = isBadTara((bwdCount - 1) % 9);
        if (!fwdBad && !bwdBad) return 3;
        if (fwdBad && bwdBad) return 0;
        return 1.5;
    }

    private boolean isBadTara(int taraIdx) {
        // 0-indexed: 2=Vipat(3rd), 4=Pratyak(5th), 6=Naidhana(7th)
        return taraIdx == 2 || taraIdx == 4 || taraIdx == 6;
    }

    private double yoniScore(int y1, int y2) {
        if (y1 == y2) return 4;
        if (NakshatraData.areYoniEnemies(y1, y2)) return 0;
        return 2;
    }

    private double grahaMaitriScore(int p1, int p2) {
        if (p1 == p2) return 5;
        int rel12 = NakshatraData.planetaryRelation(p1, p2);  // 2 friend, 1 neutral, 0 enemy
        int rel21 = NakshatraData.planetaryRelation(p2, p1);
        int hi = Math.max(rel12, rel21), lo = Math.min(rel12, rel21);
        if (hi == 2 && lo == 2) return 5;    // mutual friends
        if (hi == 2 && lo == 1) return 4;    // friend + neutral
        if (hi == 1 && lo == 1) return 3;    // both neutral
        if (hi == 2 && lo == 0) return 1;    // friend + enemy
        if (hi == 1 && lo == 0) return 0.5;  // neutral + enemy
        return 0;                            // mutual enemies
    }

    // Standard Gana matrix [groom][bride]: 0=Deva 1=Manushya 2=Rakshasa
    private static final double[][] GANA = {
        { 6, 6, 0 },   // groom Deva
        { 5, 6, 0 },   // groom Manushya
        { 1, 0, 6 },   // groom Rakshasa
    };

    private double ganaScore(int groomGana, int brideGana) {
        return GANA[groomGana][brideGana];
    }

    private double bhakootScore(int rashiBride, int rashiGroom) {
        int fwd = ((rashiGroom - rashiBride + 12) % 12);  // 0..11, 0 means same
        int bwd = ((rashiBride - rashiGroom + 12) % 12);
        // Inauspicious pairs: (2,10)=12/2 ↔ 2/12, (5,7)=6/8 ↔ 8/6
        // fwd=1→2/1, fwd=11→12/1(=12th from bride to groom?)
        // Pair positions from bride: 2(fwd=1 means groom is 2nd from bride → 2nd house relation)
        int fromBride = (fwd == 0) ? 1 : fwd + 1; // 1..12
        int fromGroom = (bwd == 0) ? 1 : bwd + 1;
        boolean bad = isBhakootBad(fromBride, fromGroom);
        return bad ? 0 : 7;
    }

    private boolean isBhakootBad(int f1, int f2) {
        // 2/12 and 12/2, 6/8 and 8/6 are inauspicious
        return (f1 == 2 && f2 == 12) || (f1 == 12 && f2 == 2)
            || (f1 == 6 && f2 == 8)  || (f1 == 8  && f2 == 6);
    }

    private String tier(double score) {
        if (score >= 32) return "EXCELLENT";
        if (score >= 27) return "GOOD";
        if (score >= 18) return "AVERAGE";
        if (score >= 10) return "POOR";
        return "INCOMPATIBLE";
    }

    private String buildSummary(double score, boolean nadiDosha, boolean rajjuDosha, boolean manglikDosha) {
        StringBuilder sb = new StringBuilder();
        sb.append(switch (tier(score)) {
            case "EXCELLENT"     -> String.format("%.1f/36 — Excellent match with strong cosmic alignment.", score);
            case "GOOD"          -> String.format("%.1f/36 — Good compatibility.", score);
            case "AVERAGE"       -> String.format("%.1f/36 — Average compatibility; remedies may help.", score);
            case "POOR"          -> String.format("%.1f/36 — Below acceptable threshold (18/36).", score);
            default              -> String.format("%.1f/36 — Significant incompatibility.", score);
        });
        if (nadiDosha) sb.append(" Nadi Dosha present — traditional remedies advised.");
        if (rajjuDosha) sb.append(" Rajju Dosha present (same Rajju group) — advisory only.");
        if (manglikDosha) sb.append(" Manglik mismatch — Kumbha Vivah or waiting for age 28 may be considered.");
        return sb.toString();
    }

    // ── Display helpers ──────────────────────────────────────────────────────

    private String varnaName(int v) {
        return new String[]{"Brahmin","Kshatriya","Vaishya","Shudra"}[v];
    }

    private String yoniName(int y) {
        return new String[]{"Horse","Elephant","Sheep","Serpent","Dog","Cat","Rat",
                "Cow","Buffalo","Tiger","Deer","Monkey","Mongoose","Lion"}[y];
    }

    private String planetName(int p) {
        return new String[]{"","Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"}[p];
    }
}
