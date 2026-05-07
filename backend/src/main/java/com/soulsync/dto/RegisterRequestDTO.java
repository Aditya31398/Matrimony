package com.soulsync.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class RegisterRequestDTO {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    private String gender;
    private String dateOfBirth;  // ISO date: yyyy-MM-dd
    private String city;
    private String state;
    private String religion;
    private String education;
    private String profession;
    private String phone;
    private List<String> interests;
    private List<String> lifestyle;
    private String bio;
    private String lookingForGender;
    private Integer ageMin;
    private Integer ageMax;
    private String partnerDescription;
    private String photoUrl;
    private List<String> photos;
    private String height;
    private String motherTongue;
    private String dietaryPreference;
    private String horoscope;
    private String caste;
}
