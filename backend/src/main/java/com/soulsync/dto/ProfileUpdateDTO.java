package com.soulsync.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateDTO {

    @Size(max = 80, message = "First name must be at most 80 characters")
    private String firstName;

    @Size(max = 80, message = "Last name must be at most 80 characters")
    private String lastName;

    @Size(max = 100, message = "City must be at most 100 characters")
    private String city;

    @Size(max = 100, message = "State must be at most 100 characters")
    private String state;

    @Size(max = 100, message = "Profession must be at most 100 characters")
    private String profession;

    @Size(max = 80, message = "Religion must be at most 80 characters")
    private String religion;

    @Size(max = 80, message = "Caste must be at most 80 characters")
    private String caste;

    @Size(max = 20, message = "Height must be at most 20 characters")
    private String height;

    @Size(max = 80, message = "Mother tongue must be at most 80 characters")
    private String motherTongue;

    @Size(max = 50, message = "Dietary preference must be at most 50 characters")
    private String dietaryPreference;

    @Size(max = 50, message = "Horoscope must be at most 50 characters")
    private String horoscope;

    @Size(max = 100, message = "Education must be at most 100 characters")
    private String education;

    @Size(max = 2000, message = "Bio must be at most 2000 characters")
    private String bio;

    @Size(max = 500, message = "Photo URL must be at most 500 characters")
    private String photoUrl;

    private List<@Size(max = 500) String> photos;

    private List<@Size(max = 80) String> interests;

    private List<@Size(max = 80) String> lifestyle;

    @Size(max = 2000, message = "Partner description must be at most 2000 characters")
    private String partnerDescription;

    @Size(max = 20, message = "Looking for gender must be at most 20 characters")
    private String lookingForGender;

    @Min(value = 18, message = "Minimum age must be at least 18")
    @Max(value = 99, message = "Minimum age must be at most 99")
    private Integer ageMin;

    @Min(value = 18, message = "Maximum age must be at least 18")
    @Max(value = 99, message = "Maximum age must be at most 99")
    private Integer ageMax;
}
