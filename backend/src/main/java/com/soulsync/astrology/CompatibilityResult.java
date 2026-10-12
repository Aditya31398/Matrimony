package com.soulsync.astrology;

import java.util.List;

public record CompatibilityResult(
    double totalScore,
    int maxScore,
    int percentage,
    String algorithm,       // "ASHTAKOOTA" | "DASHAKOOTA" | "BASIC_ZODIAC" | "NONE"
    String tier,            // "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "INCOMPATIBLE"
    String summary,
    boolean nadiDosha,
    boolean manglikDosha,
    boolean rajjuDosha,
    List<KootaScore> kootas,
    String region,                    // e.g. "SOUTH", "NORTH", "SOUTH/NORTH" (mixed)
    CompatibilityResult alternate,    // second opinion for mixed or dual-tradition pairs, else null
    List<String> advisories           // language/region-specific notes (Papasamyam, tradition notes)
) {
    /** Constructor used by the matchers; region, alternate and advisories are attached by the service. */
    public CompatibilityResult(double totalScore, int maxScore, int percentage, String algorithm,
                               String tier, String summary, boolean nadiDosha, boolean manglikDosha,
                               boolean rajjuDosha, List<KootaScore> kootas) {
        this(totalScore, maxScore, percentage, algorithm, tier, summary,
             nadiDosha, manglikDosha, rajjuDosha, kootas, null, null, List.of());
    }

    public CompatibilityResult withRegion(String region, CompatibilityResult alternate) {
        return new CompatibilityResult(totalScore, maxScore, percentage, algorithm, tier, summary,
                nadiDosha, manglikDosha, rajjuDosha, kootas, region, alternate, advisories);
    }

    public CompatibilityResult withAdvisories(List<String> advisories) {
        return new CompatibilityResult(totalScore, maxScore, percentage, algorithm, tier, summary,
                nadiDosha, manglikDosha, rajjuDosha, kootas, region, alternate, advisories);
    }

    public static CompatibilityResult insufficient(String reason) {
        return new CompatibilityResult(0, 0, 0, "NONE", "UNKNOWN", reason,
                false, false, false, List.of());
    }
}
