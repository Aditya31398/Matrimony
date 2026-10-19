package com.soulsync.dto;

import java.time.LocalDate;

/**
 * Discover search criteria; any null field means "no restriction".
 * Ages are pre-converted to birth-date bounds so the query can use the date column.
 */
public record ProfileFilter(
        String gender,
        boolean verified,
        String city,            // exact city, used by "Near me"
        String interest,
        String education,
        LocalDate bornOnOrBefore, // from minimum age
        LocalDate bornAfter,      // from maximum age
        String religion,
        String caste,
        String motherTongue,
        String location,        // matches city or state
        String diet,
        Boolean manglik,
        boolean withPhoto) {

    public static ProfileFilter ofGender(String gender) {
        return new ProfileFilter(gender, false, null, null, null, null, null, null, null, null, null, null, null, false);
    }
}
