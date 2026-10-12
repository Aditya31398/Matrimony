package com.soulsync.dto;

import com.soulsync.model.Profile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Data
@Builder
public class ProfileDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private int age;
    private String profession;
    private String city;
    private String state;
    private String religion;
    private String caste;
    private String height;
    private String motherTongue;
    private String dietaryPreference;
    private String education;
    private String horoscope;
    private String bio;
    private String photoUrl;
    private List<String> photos;
    private Boolean isVerified;
    private Boolean isPremium;
    private List<String> interests;
    private List<String> lifestyle;
    private List<String> lookingFor;
    private String lookingForGender;
    private Integer ageMin;
    private Integer ageMax;
    private String phone;
    private String nakshatra;
    private String rashi;
    private LocalDateTime premiumUntil;
    /** True when details were withheld because the viewer isn't premium */
    private boolean restricted;

    public static ProfileDTO from(Profile p) {
        return ProfileDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .age(p.getAge())
                .profession(p.getProfession())
                .city(p.getCity())
                .state(p.getState())
                .religion(p.getReligion())
                .caste(p.getCaste())
                .height(p.getHeight())
                .motherTongue(p.getMotherTongue())
                .dietaryPreference(p.getDietaryPreference())
                .education(p.getEducation())
                .horoscope(p.getHoroscope())
                .bio(p.getBio())
                .photoUrl(p.getPhotoUrl())
                .photos(splitTags(p.getPhotos()))
                .isVerified(p.getIsVerified())
                .interests(splitTags(p.getInterests()))
                .lifestyle(splitTags(p.getLifestyle()))
                .lookingFor(splitTags(p.getLookingFor()))
                .lookingForGender(p.getLookingForGender())
                .ageMin(p.getAgeMin())
                .ageMax(p.getAgeMax())
                .phone(p.getPhone())
                .nakshatra(p.getNakshatra())
                .rashi(p.getRashi())
                .isPremium(p.hasActivePremium())
                .premiumUntil(p.getPremiumUntil())
                .build();
    }

    /** What free members may see of someone else: photo, name, age, caste and religion. */
    public static ProfileDTO limited(Profile p) {
        return ProfileDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .age(p.getAge())
                .religion(p.getReligion())
                .caste(p.getCaste())
                .photoUrl(p.getPhotoUrl())
                .isVerified(p.getIsVerified())
                .isPremium(p.hasActivePremium())
                .restricted(true)
                .build();
    }

    private static List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
