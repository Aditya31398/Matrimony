package com.soulsync.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** What a family member sees through a share link — never contact details. */
@Data
@Builder
public class FamilyViewDTO {
    private String firstName;
    private String lastName;
    private int age;
    private String religion;
    private String caste;
    private String motherTongue;
    private String education;
    private String profession;
    private String city;
    private String state;
    private String height;
    private String dietaryPreference;
    private String bio;
    private List<String> interests;
    private Integer nakshatra;
    private Integer rashi;
    private String photoUrl;
    private boolean photoHidden;
    /** Only photo, name, age, caste and religion were shared (sharer isn't premium) */
    private boolean limited;
    private String sharedBy;
    private boolean sharedOwnProfile;
    private LocalDateTime expiresAt;
}
