package com.soulsync.dto;

import com.soulsync.model.Profile;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Data
@Builder
public class ProfileSummaryDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private int age;
    private String profession;
    private String city;
    private String state;
    private String photoUrl;
    private String religion;
    private String caste;
    private Boolean isVerified;
    private Boolean isPremium;
    private List<String> interests;
    private Boolean isOnline;
    private LocalDateTime lastSeenAt;
    /** True when details were withheld because the viewer isn't premium */
    private boolean restricted;

    public static ProfileSummaryDTO from(Profile p) {
        boolean online = p.getLastSeenAt() != null &&
                p.getLastSeenAt().isAfter(LocalDateTime.now().minusMinutes(2));
        return ProfileSummaryDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .age(p.getAge())
                .profession(p.getProfession())
                .city(p.getCity())
                .state(p.getState())
                .photoUrl(p.getPhotoUrl())
                .religion(p.getReligion())
                .caste(p.getCaste())
                .isVerified(p.getIsVerified())
                .isPremium(p.hasActivePremium())
                .interests(splitTags(p.getInterests()))
                .isOnline(online)
                .lastSeenAt(p.getLastSeenAt())
                .build();
    }

    public static ProfileSummaryDTO from(Profile p, boolean viewerIsPremium) {
        return viewerIsPremium ? from(p) : limited(p);
    }

    /** Free members only see photo, name, age, caste and religion. */
    public static ProfileSummaryDTO limited(Profile p) {
        return ProfileSummaryDTO.builder()
                .id(p.getId())
                .firstName(p.getFirstName())
                .lastName(p.getLastName())
                .age(p.getAge())
                .photoUrl(p.getPhotoUrl())
                .religion(p.getReligion())
                .caste(p.getCaste())
                .isVerified(p.getIsVerified())
                .isPremium(p.hasActivePremium())
                .interests(List.of())
                .restricted(true)
                .build();
    }

    private static List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
