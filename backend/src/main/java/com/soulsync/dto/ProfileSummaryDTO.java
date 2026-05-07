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
    private Boolean isVerified;
    private Boolean isPremium;
    private List<String> interests;
    private Boolean isOnline;
    private LocalDateTime lastSeenAt;

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
                .isVerified(p.getIsVerified())
                .isPremium(p.getIsPremium())
                .interests(splitTags(p.getInterests()))
                .isOnline(online)
                .lastSeenAt(p.getLastSeenAt())
                .build();
    }

    private static List<String> splitTags(String csv) {
        if (csv == null || csv.isBlank()) return List.of();
        return Arrays.stream(csv.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}
