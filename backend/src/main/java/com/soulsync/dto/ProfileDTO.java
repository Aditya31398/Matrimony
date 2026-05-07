package com.soulsync.dto;

import com.soulsync.model.Profile;
import lombok.Builder;
import lombok.Data;

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
    private Boolean isVerified;
    private Boolean isPremium;
    private List<String> interests;
    private List<String> lifestyle;
    private List<String> lookingFor;
    private String lookingForGender;
    private Integer ageMin;
    private Integer ageMax;

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
                .isVerified(p.getIsVerified())
                .isPremium(p.getIsPremium())
                .interests(splitTags(p.getInterests()))
                .lifestyle(splitTags(p.getLifestyle()))
                .lookingFor(splitTags(p.getLookingFor()))
                .lookingForGender(p.getLookingForGender())
                .ageMin(p.getAgeMin())
                .ageMax(p.getAgeMax())
                .build();
    }

    private static List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
