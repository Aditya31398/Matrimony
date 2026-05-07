package com.soulsync.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateDTO {
    private String firstName;
    private String lastName;
    private String city;
    private String state;
    private String profession;
    private String religion;
    private String caste;
    private String height;
    private String motherTongue;
    private String dietaryPreference;
    private String horoscope;
    private String education;
    private String bio;
    private String photoUrl;
    private List<String> photos;
    private List<String> interests;
    private List<String> lifestyle;
    private String partnerDescription;
    private String lookingForGender;
    private Integer ageMin;
    private Integer ageMax;
}
