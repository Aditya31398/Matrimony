package com.soulsync.astrology;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;

import java.io.IOException;
import java.util.List;

/**
 * Star and rashi arrive as numbers (1-based) from the current forms, but older
 * clients send names like "Rohini" or "Vrishabha". Accept both.
 */
public final class StarFieldDeserializers {

    private StarFieldDeserializers() {}

    private static final List<String> RASHI_NAMES = List.of(
            "mesha", "vrishabha", "mithuna", "karka", "simha", "kanya",
            "tula", "vrishchika", "dhanu", "makara", "kumbha", "meena");

    private static final List<String> RASHI_ENGLISH = List.of(
            "aries", "taurus", "gemini", "cancer", "leo", "virgo",
            "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces");

    public static class Nakshatra extends JsonDeserializer<Integer> {
        @Override
        public Integer deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
            return parse(p, 27, name -> {
                for (int i = 0; i < NakshatraData.NAMES.length; i++) {
                    if (normalize(NakshatraData.NAMES[i]).equals(name)) return i + 1;
                }
                // Common spelling variants
                if (name.equals("dhanishta")) return 23;
                return null;
            });
        }
    }

    public static class Rashi extends JsonDeserializer<Integer> {
        @Override
        public Integer deserialize(JsonParser p, DeserializationContext ctx) throws IOException {
            return parse(p, 12, name -> {
                for (int i = 0; i < 12; i++) {
                    if (name.startsWith(RASHI_NAMES.get(i)) || name.startsWith(RASHI_ENGLISH.get(i))) return i + 1;
                }
                if (name.startsWith("vrischika")) return 8;
                return null;
            });
        }
    }

    private interface NameLookup { Integer find(String normalized); }

    private static Integer parse(JsonParser p, int max, NameLookup lookup) throws IOException {
        if (p.currentToken() == JsonToken.VALUE_NULL) return null;
        String raw = p.getValueAsString();
        if (raw == null || raw.isBlank()) return null;
        raw = raw.trim();
        Integer value;
        if (raw.matches("\\d+")) {
            value = Integer.parseInt(raw);
        } else {
            value = lookup.find(normalize(raw));
        }
        if (value == null || value < 1 || value > max) {
            throw InvalidFormatException.from(p, "Unknown value: " + raw, raw, Integer.class);
        }
        return value;
    }

    private static String normalize(String s) {
        return s.toLowerCase().replaceAll("[^a-z]", "");
    }
}
