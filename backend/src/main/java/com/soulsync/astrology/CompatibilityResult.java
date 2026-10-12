package com.soulsync.astrology;

import java.util.List;

public record CompatibilityResult(
    double totalScore,
    int maxScore,
    int percentage,
    String algorithm,       // "ASHTAKOOTA" | "DASHAKOOTA" | "BASIC_ZODIAC"
    String tier,            // "EXCELLENT" | "GOOD" | "AVERAGE" | "POOR" | "INCOMPATIBLE"
    String summary,
    boolean nadiDosha,
    boolean manglikDosha,
    boolean rajjuDosha,
    List<KootaScore> kootas
) {
    public static CompatibilityResult insufficient(String reason) {
        return new CompatibilityResult(0, 0, 0, "NONE", "UNKNOWN", reason,
                false, false, false, List.of());
    }
}
