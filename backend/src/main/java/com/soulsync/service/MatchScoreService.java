package com.soulsync.service;

import com.soulsync.astrology.CompatibilityService;
import com.soulsync.model.Profile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Preference-based "match %" between a viewer and a candidate. Only factors where both
 * sides have data count, so sparse profiles aren't punished. Factors built from fields
 * free members can't see are scored but their detail is withheld.
 */
@Service
@RequiredArgsConstructor
public class MatchScoreService {

    /** Below this much comparable data the percentage would be noise. */
    private static final int MIN_COMPARABLE_POINTS = 30;

    private final CompatibilityService compatibilityService;

    public record Factor(String label, int points, int max, boolean locked) {}

    public record Score(Integer percent, List<Factor> factors) {}

    public Score score(ViewerContext ctx, Profile c) {
        Profile v = ctx.viewer();
        if (v == null || v.getId().equals(c.getId())) return new Score(null, List.of());
        boolean full = ctx.premium();
        List<Factor> f = new ArrayList<>();

        // Their age against my preferred range (age is visible to everyone)
        int age = c.getAge();
        if (age > 0) {
            int min = Objects.requireNonNullElse(v.getAgeMin(), 18), max = Objects.requireNonNullElse(v.getAgeMax(), 99);
            int pts = age >= min && age <= max ? 25 : (age >= min - 2 && age <= max + 2 ? 12 : 0);
            f.add(new Factor(pts == 25 ? "Age " + age + " is in your " + min + "–" + max + " range"
                    : "Age " + age + " is outside your " + min + "–" + max + " range", pts, 25, false));
        }
        // My age against their preferred range
        if (v.getAge() > 0 && (c.getAgeMin() != null || c.getAgeMax() != null)) {
            int min = Objects.requireNonNullElse(c.getAgeMin(), 18), max = Objects.requireNonNullElse(c.getAgeMax(), 99);
            boolean fits = v.getAge() >= min && v.getAge() <= max;
            f.add(new Factor(fits ? "You fit their age preference" : "You're outside their age preference",
                    fits ? 10 : 0, 10, !full));
        }
        if (bothSet(v.getReligion(), c.getReligion())) {
            boolean same = v.getReligion().equalsIgnoreCase(c.getReligion());
            f.add(new Factor(same ? "Both " + c.getReligion() : "Different religions", same ? 20 : 0, 20, false));
        }
        if (bothSet(v.getMotherTongue(), c.getMotherTongue())) {
            boolean same = v.getMotherTongue().equalsIgnoreCase(c.getMotherTongue());
            f.add(new Factor(same ? "Both speak " + c.getMotherTongue() : "Different mother tongues", same ? 15 : 0, 15, !full));
        }
        if (bothSet(v.getCity(), c.getCity()) || bothSet(v.getState(), c.getState())) {
            boolean sameCity = bothSet(v.getCity(), c.getCity()) && v.getCity().equalsIgnoreCase(c.getCity());
            boolean sameState = bothSet(v.getState(), c.getState()) && v.getState().equalsIgnoreCase(c.getState());
            int pts = sameCity ? 10 : sameState ? 5 : 0;
            f.add(new Factor(sameCity ? "Both in " + c.getCity() : sameState ? "Same state (" + c.getState() + ")"
                    : "Different locations", pts, 10, !full));
        }
        Set<String> shared = tags(v.getInterests());
        shared.retainAll(tags(c.getInterests()));
        if (!tags(v.getInterests()).isEmpty() && !tags(c.getInterests()).isEmpty()) {
            int pts = Math.min(15, shared.size() * 5);
            f.add(new Factor(shared.isEmpty() ? "No shared interests yet"
                    : "Shared interests: " + String.join(", ", shared), pts, 15, !full));
        }
        if (bothSet(v.getDietaryPreference(), c.getDietaryPreference())) {
            boolean same = v.getDietaryPreference().equalsIgnoreCase(c.getDietaryPreference());
            f.add(new Factor(same ? "Same diet (" + c.getDietaryPreference() + ")" : "Different diets", same ? 5 : 0, 5, !full));
        }
        // Horoscope only feeds the score when the viewer may see it
        if (full && v.getNakshatra() != null && c.getNakshatra() != null) {
            var compat = compatibilityService.compute(v, c);
            int pts = (int) Math.round(compat.percentage() * 15 / 100.0);
            f.add(new Factor("Horoscope match " + compat.percentage() + "%", pts, 15, false));
        }

        int max = f.stream().mapToInt(Factor::max).sum();
        int pts = f.stream().mapToInt(Factor::points).sum();
        Integer percent = max < MIN_COMPARABLE_POINTS ? null : (int) Math.round(pts * 100.0 / max);
        // Withhold labels that reveal premium-only fields
        List<Factor> visible = f.stream()
                .map(x -> x.locked() ? new Factor(lockedLabel(x), x.points(), x.max(), true) : x)
                .toList();
        return new Score(percent, visible);
    }

    private static String lockedLabel(Factor f) {
        String l = f.label();
        if (l.contains("age preference")) return "Their age preference";
        if (l.contains("tongue") || l.contains("speak")) return "Mother tongue";
        if (l.contains("location") || l.contains("Both in") || l.contains("state")) return "Location";
        if (l.contains("interest")) return "Interests";
        if (l.contains("diet")) return "Diet";
        return "Details";
    }

    private static boolean bothSet(String a, String b) {
        return a != null && !a.isBlank() && b != null && !b.isBlank();
    }

    private static Set<String> tags(String csv) {
        if (csv == null || csv.isBlank()) return new java.util.LinkedHashSet<>();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
    }
}
