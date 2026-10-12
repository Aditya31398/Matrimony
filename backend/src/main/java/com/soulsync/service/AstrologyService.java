package com.soulsync.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Ashtakoot Guna Milan (36-point) compatibility from each partner's birth star (Nakshatra)
 * and moon sign (Rashi), using the traditional lookup tables — no external API needed.
 */
@Service
public class AstrologyService {

    public static final List<String> NAKSHATRAS = List.of(
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
            "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
            "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
            "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
            "Uttara Bhadrapada", "Revati");

    public static final List<String> RASHIS = List.of(
            "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
            "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena");

    // ── Nakshatra attributes ────────────────────────────────────────────────

    private enum Yoni { HORSE, ELEPHANT, SHEEP, SERPENT, DOG, CAT, RAT, COW, BUFFALO, TIGER, DEER, MONKEY, MONGOOSE, LION }

    private static final Yoni[] NAKSHATRA_YONI = {
            Yoni.HORSE, Yoni.ELEPHANT, Yoni.SHEEP, Yoni.SERPENT, Yoni.SERPENT, Yoni.DOG, Yoni.CAT,
            Yoni.SHEEP, Yoni.CAT, Yoni.RAT, Yoni.RAT, Yoni.COW, Yoni.BUFFALO,
            Yoni.TIGER, Yoni.BUFFALO, Yoni.TIGER, Yoni.DEER, Yoni.DEER, Yoni.DOG, Yoni.MONKEY,
            Yoni.MONGOOSE, Yoni.MONKEY, Yoni.LION, Yoni.HORSE, Yoni.LION,
            Yoni.COW, Yoni.ELEPHANT };

    /** Symmetric yoni compatibility (4 = same yoni, 0 = sworn enemies), indexed by Yoni ordinal. */
    private static final int[][] YONI_POINTS = {
            {4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1},
            {2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0},
            {2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1},
            {3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2},
            {2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1},
            {2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1},
            {2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2},
            {1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1},
            {0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1},
            {1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1},
            {3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1},
            {3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2},
            {2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2},
            {1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4},
    };

    private enum Gana { DEVA, MANUSHYA, RAKSHASA }

    private static final Gana[] NAKSHATRA_GANA = {
            Gana.DEVA, Gana.MANUSHYA, Gana.RAKSHASA, Gana.MANUSHYA, Gana.DEVA, Gana.MANUSHYA, Gana.DEVA,
            Gana.DEVA, Gana.RAKSHASA, Gana.RAKSHASA, Gana.MANUSHYA, Gana.MANUSHYA, Gana.DEVA,
            Gana.RAKSHASA, Gana.DEVA, Gana.RAKSHASA, Gana.DEVA, Gana.RAKSHASA, Gana.RAKSHASA, Gana.MANUSHYA,
            Gana.MANUSHYA, Gana.DEVA, Gana.RAKSHASA, Gana.RAKSHASA, Gana.MANUSHYA,
            Gana.MANUSHYA, Gana.DEVA };

    /** Rows = bride's gana, columns = groom's gana. */
    private static final int[][] GANA_POINTS = {
            {6, 6, 0},
            {5, 6, 0},
            {1, 0, 6},
    };

    /** Nadi repeats Adi, Madhya, Antya, Antya, Madhya, Adi … across the 27 stars. */
    private static int nadi(int nakshatra) {
        int[] cycle = {0, 1, 2, 2, 1, 0};
        return cycle[nakshatra % 6];
    }

    // ── Rashi attributes ────────────────────────────────────────────────────

    private enum Planet { SUN, MOON, MARS, MERCURY, JUPITER, VENUS, SATURN }

    private static final Planet[] RASHI_LORD = {
            Planet.MARS, Planet.VENUS, Planet.MERCURY, Planet.MOON, Planet.SUN, Planet.MERCURY,
            Planet.VENUS, Planet.MARS, Planet.JUPITER, Planet.SATURN, Planet.SATURN, Planet.JUPITER };

    /** Brahmin 4, Kshatriya 3, Vaishya 2, Shudra 1 */
    private static final int[] RASHI_VARNA = {3, 2, 1, 4, 3, 2, 1, 4, 3, 2, 1, 4};

    private enum Vashya { CHATUSHPADA, MANAVA, JALACHARA, VANACHARA, KEETA }

    /** Rows = groom's vashya, columns = bride's vashya. */
    private static final double[][] VASHYA_POINTS = {
            {2, 1, 1, 0.5, 1},
            {1, 2, 0.5, 0, 1},
            {1, 0.5, 2, 1, 1},
            {0, 0, 0, 2, 0},
            {1, 1, 1, 0, 2},
    };

    /** Natural friendships: +1 friend, 0 neutral, -1 enemy. Indexed [planet][other]. */
    private static final int[][] FRIENDSHIP = {
            //  SUN MOON MARS MERC JUP VEN SAT
            {   1,  1,   1,   0,   1, -1, -1},   // Sun
            {   1,  1,   0,   1,   0,  0,  0},   // Moon
            {   1,  1,   1,  -1,   1,  0,  0},   // Mars
            {   1, -1,   0,   1,   0,  1,  0},   // Mercury
            {   1,  1,   1,  -1,   1, -1,  0},   // Jupiter
            {  -1, -1,   0,   1,   0,  1,  1},   // Venus
            {  -1, -1,  -1,   1,   0,  1,  1},   // Saturn
    };

    /** Rashis each star falls in; stars that straddle two signs list both. */
    private static final Map<Integer, Set<Integer>> NAKSHATRA_RASHIS = new LinkedHashMap<>();

    static {
        // Each rashi spans 2.25 stars (9 padas); a star's 4 padas may fall in one or two signs
        for (int n = 0; n < 27; n++) {
            int firstPada = n * 4, lastPada = n * 4 + 3;
            NAKSHATRA_RASHIS.put(n, new HashSet<>(List.of(firstPada / 9, lastPada / 9)));
        }
    }

    // ── Public API ──────────────────────────────────────────────────────────

    public static boolean isValidNakshatra(String name) { return indexOf(NAKSHATRAS, name) >= 0; }

    public static boolean isValidRashi(String name) { return indexOf(RASHIS, name) >= 0; }

    /** Whether the moon sign is possible for the given birth star. */
    public static boolean isConsistent(String nakshatra, String rashi) {
        int n = indexOf(NAKSHATRAS, nakshatra), r = indexOf(RASHIS, rashi);
        return n >= 0 && r >= 0 && NAKSHATRA_RASHIS.get(n).contains(r);
    }

    public record Koota(String name, double points, double max, String meaning) {}

    public record MatchResult(double total, double max, String verdict,
                              List<Koota> kootas, List<String> doshas) {}

    public MatchResult match(String brideNakshatra, String brideRashi,
                             String groomNakshatra, String groomRashi) {
        int bn = indexOf(NAKSHATRAS, brideNakshatra), gn = indexOf(NAKSHATRAS, groomNakshatra);
        int br = indexOf(RASHIS, brideRashi),         gr = indexOf(RASHIS, groomRashi);
        if (bn < 0 || gn < 0 || br < 0 || gr < 0) {
            throw new IllegalArgumentException("Both profiles need a valid star and rashi");
        }

        List<Koota> kootas = new ArrayList<>();
        List<String> doshas = new ArrayList<>();

        kootas.add(new Koota("Varna", RASHI_VARNA[gr] >= RASHI_VARNA[br] ? 1 : 0, 1,
                "Spiritual compatibility and ego"));

        kootas.add(new Koota("Vashya", VASHYA_POINTS[vashya(gn, gr).ordinal()][vashya(bn, br).ordinal()], 2,
                "Mutual attraction and influence"));

        kootas.add(new Koota("Tara", tara(bn, gn), 3, "Health and well-being"));

        kootas.add(new Koota("Yoni",
                YONI_POINTS[NAKSHATRA_YONI[bn].ordinal()][NAKSHATRA_YONI[gn].ordinal()], 4,
                "Physical and intimate compatibility"));

        kootas.add(new Koota("Graha Maitri", grahaMaitri(RASHI_LORD[br], RASHI_LORD[gr]), 5,
                "Mental compatibility and friendship"));

        kootas.add(new Koota("Gana",
                GANA_POINTS[NAKSHATRA_GANA[bn].ordinal()][NAKSHATRA_GANA[gn].ordinal()], 6,
                "Temperament"));

        // Count from bride's sign to groom's (inclusive); 2/12, 5/9 and 6/8 positions are doshas
        int distance = Math.floorMod(gr - br, 12) + 1;
        boolean bhakootDosha = Set.of(2, 12, 5, 9, 6, 8).contains(distance);
        kootas.add(new Koota("Bhakoot", bhakootDosha ? 0 : 7, 7, "Family welfare and prosperity"));
        if (bhakootDosha) doshas.add("Bhakoot Dosha");

        boolean nadiDosha = nadi(bn) == nadi(gn);
        kootas.add(new Koota("Nadi", nadiDosha ? 0 : 8, 8, "Health and progeny"));
        if (nadiDosha) doshas.add("Nadi Dosha");

        double total = kootas.stream().mapToDouble(Koota::points).sum();
        return new MatchResult(total, 36, verdict(total), kootas, doshas);
    }

    // ── Koota helpers ───────────────────────────────────────────────────────

    /** Counts are taken both ways; 3rd, 5th and 7th tara (mod 9) are inauspicious. */
    private static double tara(int bride, int groom) {
        int toGroom = (Math.floorMod(groom - bride, 27) + 1) % 9;
        int toBride = (Math.floorMod(bride - groom, 27) + 1) % 9;
        Set<Integer> bad = Set.of(3, 5, 7);
        return (bad.contains(toGroom) ? 0 : 1.5) + (bad.contains(toBride) ? 0 : 1.5);
    }

    private static double grahaMaitri(Planet a, Planet b) {
        if (a == b) return 5;
        int ab = FRIENDSHIP[a.ordinal()][b.ordinal()];
        int ba = FRIENDSHIP[b.ordinal()][a.ordinal()];
        int sum = ab + ba;
        if (ab == 1 && ba == 1) return 5;
        if (sum == 1) return 4;                       // friend + neutral
        if (ab == 0 && ba == 0) return 3;             // both neutral
        if (sum == 0) return 1;                       // friend + enemy
        if (sum == -1) return 0.5;                    // neutral + enemy
        return 0;                                     // both enemies
    }

    /**
     * Dhanu and Makara are split by half-sign; without birth degrees we use the star to pick
     * the half (Mula ≈ first half of Dhanu, Uttara Ashadha ≈ first half of Makara).
     */
    private static Vashya vashya(int nakshatra, int rashi) {
        return switch (rashi) {
            case 0, 1 -> Vashya.CHATUSHPADA;
            case 2, 5, 6, 10 -> Vashya.MANAVA;
            case 3, 11 -> Vashya.JALACHARA;
            case 4 -> Vashya.VANACHARA;
            case 7 -> Vashya.KEETA;
            case 8 -> nakshatra == 18 ? Vashya.MANAVA : Vashya.CHATUSHPADA;
            case 9 -> nakshatra == 20 ? Vashya.CHATUSHPADA : Vashya.JALACHARA;
            default -> throw new IllegalArgumentException("Unknown rashi");
        };
    }

    private static String verdict(double total) {
        if (total < 18) return "Not recommended";
        if (total < 25) return "Average match";
        if (total < 33) return "Good match";
        return "Excellent match";
    }

    private static int indexOf(List<String> list, String name) {
        if (name == null) return -1;
        for (int i = 0; i < list.size(); i++) {
            if (list.get(i).equalsIgnoreCase(name.trim())) return i;
        }
        return -1;
    }
}
