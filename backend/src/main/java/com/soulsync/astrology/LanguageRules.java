package com.soulsync.astrology;

import java.util.List;
import java.util.Map;

/**
 * Per-language matching practice. This is the single place to adjust how a mother tongue
 * is handled. The table reflects commonly described community practice and should be
 * reviewed by a Jyotishi before being treated as authoritative.
 */
public final class LanguageRules {

    private LanguageRules() {}

    public enum Algo { ASHTAKOOTA, DASHAKOOTA }

    /**
     * @param primary      algorithm run first and shown prominently
     * @param alsoShow     second algorithm to show alongside (nullable)
     * @param papasamyam   compare papa points (Kerala practice)
     * @param note         community-specific note appended to advisories (nullable)
     */
    public record Rule(String label, Algo primary, Algo alsoShow, boolean papasamyam, String note) {}

    private static final Rule DEFAULT = new Rule("Default", Algo.ASHTAKOOTA, null, false, null);

    private static final String BENGALI_NOTE =
            "Bengali families often also use Rajyotak and Gotra checks, which are not scored here.";

    private static final Map<String, Rule> RULES = Map.ofEntries(
        Map.entry("tamil",      new Rule("Tamil", Algo.DASHAKOOTA, null, false,
            "Tamil practice: 10 Poruthams; Rajju porutham is treated as essential.")),
        Map.entry("telugu",     new Rule("Telugu", Algo.DASHAKOOTA, null, false,
            "Telugu practice: 10 Poruthams (Poruthalu); Rajju porutham is treated as essential.")),
        Map.entry("malayalam",  new Rule("Malayalam", Algo.DASHAKOOTA, null, true,
            "Kerala practice: 10 Poruthams plus Papasamyam (malefic-planet balance).")),
        Map.entry("tulu",       new Rule("Tulu", Algo.DASHAKOOTA, null, false, null)),
        Map.entry("kannada",    new Rule("Kannada", Algo.ASHTAKOOTA, Algo.DASHAKOOTA, false,
            "Karnataka families use either Ashtakoota or Porutham, so both are shown.")),
        Map.entry("marathi",    new Rule("Marathi", Algo.ASHTAKOOTA, null, false,
            "Marathi practice: Gun Milan (Ashtakoota); Nadi and Gana carry extra weight and Gotra is also checked.")),
        Map.entry("gujarati",   new Rule("Gujarati", Algo.ASHTAKOOTA, null, false,
            "Gujarati practice: Gun Milan (Ashtakoota); Nadi and Gana carry extra weight.")),
        Map.entry("hindi",      new Rule("Hindi", Algo.ASHTAKOOTA, null, false,
            "North Indian practice: Gun Milan (Ashtakoota); 18/36 is the usual minimum.")),
        Map.entry("punjabi",    new Rule("Punjabi", Algo.ASHTAKOOTA, null, false,
            "Punjabi Hindu practice: Gun Milan (Ashtakoota); 18/36 is the usual minimum.")),
        Map.entry("rajasthani", new Rule("Rajasthani", Algo.ASHTAKOOTA, null, false, null)),
        Map.entry("bengali",    new Rule("Bengali", Algo.ASHTAKOOTA, null, false, BENGALI_NOTE)),
        Map.entry("bangla",     new Rule("Bengali", Algo.ASHTAKOOTA, null, false, BENGALI_NOTE)),
        Map.entry("odia",       new Rule("Odia", Algo.ASHTAKOOTA, null, false,
            "Odia families commonly also use Gotra checks, which are not scored here.")),
        Map.entry("oriya",      new Rule("Odia", Algo.ASHTAKOOTA, null, false, null)),
        Map.entry("assamese",   new Rule("Assamese", Algo.ASHTAKOOTA, null, false, null)),
        Map.entry("konkani",    new Rule("Konkani", Algo.ASHTAKOOTA, null, false, null))
    );

    // South Indian languages win in a multi-language value (e.g. "Hindi, Telugu").
    private static final List<String> PRIORITY = List.of(
        "malayalam", "tamil", "telugu", "tulu", "kannada",
        "marathi", "gujarati", "bengali", "bangla", "odia", "oriya", "assamese", "konkani",
        "punjabi", "rajasthani", "hindi");

    public static Rule forMotherTongue(String motherTongue) {
        String v = motherTongue == null ? "" : motherTongue.toLowerCase();
        for (String key : PRIORITY) {
            if (v.contains(key)) return RULES.get(key);
        }
        return DEFAULT;
    }
}
