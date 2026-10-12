package com.soulsync.astrology;

/**
 * Static lookup tables for all 27 Vedic nakshatras (1-indexed).
 * Array index = nakshatra - 1  (so index 0 = Ashwini, index 26 = Revati).
 */
public final class NakshatraData {

    private NakshatraData() {}

    public static final String[] NAMES = {
        "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu",
        "Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta",
        "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha",
        "Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada",
        "Uttara Bhadrapada","Revati"
    };

    // Primary Rashi for each nakshatra (1=Aries … 12=Pisces), pada-1 based.
    public static final int[] RASHI = {
        1,1,1,2,2,3,3,4,4,5,5,5,6,6,7,7,8,8,9,9,9,10,10,11,11,12,12
    };

    // Gana: 0=DEVA  1=MANUSHYA  2=RAKSHASA
    public static final int[] GANA = {
        0,1,2,1,0,1,0,0,2,2,1,1,0,2,0,2,0,2,2,1,1,0,2,2,1,1,0
    };

    // Nadi: 0=AADI  1=MADHYA  2=ANTYA — zig-zag pattern repeating every 6 nakshatras:
    // Aadi: 1,6,7,12,13,18,19,24,25  Madhya: 2,5,8,11,14,17,20,23,26
    // Antya: 3,4,9,10,15,16,21,22,27
    private static final int[] NADI_CYCLE = {0, 1, 2, 2, 1, 0};
    public static int nadi(int nakshatra) {
        return NADI_CYCLE[(nakshatra - 1) % 6];
    }

    // Yoni animal (0..13) for Yoni Koota
    // 0=HORSE 1=ELEPHANT 2=SHEEP 3=SERPENT 4=DOG 5=CAT 6=RAT
    // 7=COW 8=BUFFALO 9=TIGER 10=DEER 11=MONKEY 12=MONGOOSE 13=LION
    public static final int[] YONI = {
        0,1,2,3,3,4,5,2,5,6,6,7,8,9,8,9,10,10,4,11,12,11,13,0,13,7,1
    };

    // Rajju: 0=PADA(feet) 1=KATI(waist) 2=NABHI(navel) 3=KANTHA(neck) 4=SIRO(head)
    // PADA : Ashwini, Ashlesha, Magha, Jyeshtha, Mula, Revati
    // KATI : Bharani, Pushya, P.Phalguni, Anuradha, P.Ashadha, U.Bhadrapada
    // NABHI: Krittika, Punarvasu, U.Phalguni, Vishakha, U.Ashadha, P.Bhadrapada
    // KANTHA: Rohini, Ardra, Hasta, Swati, Shravana, Shatabhisha
    // SIRO : Mrigashira, Chitra, Dhanishtha
    public static final int[] RAJJU = {
        0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0,0,1,2,3,4,3,2,1,0
    };

    // Varna by Moon sign (rashi 1..12): 0=BRAHMIN 1=KSHATRIYA 2=VAISHYA 3=SHUDRA
    public static int varnaOfRashi(int rashi) {
        return switch (rashi) {
            case 4, 8, 12 -> 0;   // Cancer, Scorpio, Pisces
            case 1, 5, 9  -> 1;   // Aries, Leo, Sagittarius
            case 2, 6, 10 -> 2;   // Taurus, Virgo, Capricorn
            default       -> 3;   // Gemini, Libra, Aquarius
        };
    }

    // Vashya group by rashi: 0=CHATUSHPADA 1=MANAVA 2=JALACHARA 3=VANACHARA 4=KEETA
    public static int vashyaGroup(int rashi) {
        return switch (rashi) {
            case 1, 2, 9, 10 -> 0;   // Aries, Taurus, Sagittarius, Capricorn
            case 3, 6, 7, 11 -> 1;   // Gemini, Virgo, Libra, Aquarius
            case 4, 12       -> 2;   // Cancer, Pisces
            case 5           -> 3;   // Leo
            default          -> 4;   // Scorpio
        };
    }

    // Rashi ruling planet: 1=Sun, 2=Moon, 3=Mars, 4=Mercury, 5=Jupiter, 6=Venus, 7=Saturn
    // Aries=3, Taurus=6, Gemini=4, Cancer=2, Leo=1, Virgo=4,
    // Libra=6, Scorpio=3, Sagittarius=5, Capricorn=7, Aquarius=7, Pisces=5
    public static final int[] RASHI_LORD = {0, 3,6,4,2,1,4,6,3,5,7,7,5}; // index 0 unused

    // Planetary friendship table. FRIENDS[p] = set of planets that are friends of p.
    // 1=Sun 2=Moon 3=Mars 4=Mercury 5=Jupiter 6=Venus 7=Saturn
    // enemy[p] = set of planets that are enemies of p
    private static final int[][] FRIENDS = {
        {},            // 0 unused
        {2,3,5},       // Sun: Moon,Mars,Jupiter
        {1,4},         // Moon: Sun,Mercury
        {1,2,5},       // Mars: Sun,Moon,Jupiter
        {1,6},         // Mercury: Sun,Venus
        {1,2,3},       // Jupiter: Sun,Moon,Mars
        {4,7},         // Venus: Mercury,Saturn
        {4,6},         // Saturn: Mercury,Venus
    };
    private static final int[][] ENEMIES = {
        {},
        {7,6},         // Sun: Saturn,Venus
        {},            // Moon: none
        {4},           // Mars: Mercury
        {2},           // Mercury: Moon
        {4,6},         // Jupiter: Mercury,Venus
        {1,2},         // Venus: Sun,Moon
        {1,2,3},       // Saturn: Sun,Moon,Mars
    };

    public static int planetaryRelation(int p1, int p2) {
        // Returns: 2=friend, 1=neutral, 0=enemy
        boolean p1FriendOfP2 = contains(FRIENDS[p2], p1);
        boolean p1EnemyOfP2  = contains(ENEMIES[p2], p1);
        if (p1FriendOfP2) return 2;
        if (p1EnemyOfP2)  return 0;
        return 1;
    }

    // Yoni enemy pairs (each element = pair of yoni animals that are hostile)
    private static final int[][] YONI_ENEMY_PAIRS = {
        {0, 8},   // HORSE vs BUFFALO
        {1, 13},  // ELEPHANT vs LION
        {2, 11},  // SHEEP vs MONKEY
        {3, 12},  // SERPENT vs MONGOOSE
        {4, 10},  // DOG vs DEER
        {5, 6},   // CAT vs RAT
        {7, 9},   // COW vs TIGER
    };

    public static boolean areYoniEnemies(int y1, int y2) {
        for (int[] pair : YONI_ENEMY_PAIRS) {
            if ((pair[0] == y1 && pair[1] == y2) || (pair[1] == y1 && pair[0] == y2)) return true;
        }
        return false;
    }

    // Rashi element: 0=Fire 1=Earth 2=Air 3=Water
    // Fire: 1(Aries),5(Leo),9(Sag)  Earth: 2(Taurus),6(Virgo),10(Cap)
    // Air: 3(Gem),7(Lib),11(Aqu)    Water: 4(Can),8(Sco),12(Pis)
    public static int rashiElement(int rashi) {
        return ((rashi - 1) % 4);  // 0=Fire,1=Earth,2=Air,3=Water in Aries=1 pattern
        // Aries(1)→0=Fire, Taurus(2)→1=Earth, Gemini(3)→2=Air, Cancer(4)→3=Water, Leo(5)→0=Fire ...
    }

    private static boolean contains(int[] arr, int val) {
        for (int v : arr) if (v == val) return true;
        return false;
    }

    public static String nadiName(int nakshatra) {
        return switch (nadi(nakshatra)) {
            case 0 -> "Aadi";
            case 1 -> "Madhya";
            default -> "Antya";
        };
    }

    public static String ganaName(int nakshatra) {
        return switch (GANA[nakshatra - 1]) {
            case 0 -> "Deva";
            case 1 -> "Manushya";
            default -> "Rakshasa";
        };
    }

    private static final String[] RASHI_SANSKRIT = {
        "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
        "tula", "vrishchika", "dhanu", "makara", "kumbha", "meena"
    };

    private static String key(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("[^a-z]", "");
    }

    /** 1..27 for a nakshatra name (tolerates spelling variants such as Dhanishta), 0 if unknown. */
    public static int nakshatraIndex(String name) {
        String k = key(name);
        if (k.isEmpty()) return 0;
        for (int i = 0; i < NAMES.length; i++) {
            if (key(NAMES[i]).equals(k)) return i + 1;
        }
        if (k.equals("dhanishta")) return 23;
        return 0;
    }

    /** 1..12 for a rashi given in Sanskrit (Mesha) or English (Aries) form, 0 if unknown. */
    public static int rashiIndex(String name) {
        String k = key(name);
        if (k.isEmpty()) return 0;
        for (int i = 1; i <= 12; i++) {
            if (key(rashiName(i)).equals(k) || RASHI_SANSKRIT[i - 1].equals(k)) return i;
        }
        return 0;
    }

    public static String rashiName(int rashi) {
        return new String[]{"","Aries","Taurus","Gemini","Cancer","Leo","Virgo",
                "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"}[rashi];
    }
}
