package com.soulsync.astrology;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.soulsync.dto.RegisterRequestDTO;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class StarFieldDeserializersTest {

    private final ObjectMapper mapper = new ObjectMapper();

    private RegisterRequestDTO read(String json) throws Exception {
        return mapper.readValue(json, RegisterRequestDTO.class);
    }

    @Test
    void acceptsNumbersAndNumericStrings() throws Exception {
        var r = read("{\"nakshatra\":4,\"rashi\":2}");
        assertEquals(4, r.getNakshatra());
        assertEquals(2, r.getRashi());
        assertEquals(11, read("{\"nakshatra\":\"11\"}").getNakshatra());
    }

    @Test
    void acceptsNamesFromOlderForms() throws Exception {
        var r = read("{\"nakshatra\":\"Rohini\",\"rashi\":\"Vrishabha\"}");
        assertEquals(4, r.getNakshatra());
        assertEquals(2, r.getRashi());
        assertEquals(23, read("{\"nakshatra\":\"Dhanishta\"}").getNakshatra());
        assertEquals(12, read("{\"rashi\":\"Pisces (Meena)\"}").getRashi());
    }

    @Test
    void blankMeansNotSet() throws Exception {
        var r = read("{\"nakshatra\":\"\",\"rashi\":null}");
        assertNull(r.getNakshatra());
        assertNull(r.getRashi());
    }

    @Test
    void rejectsUnknownOrOutOfRange() {
        assertThrows(InvalidFormatException.class, () -> read("{\"nakshatra\":\"Pluto\"}"));
        assertThrows(InvalidFormatException.class, () -> read("{\"rashi\":13}"));
    }
}
