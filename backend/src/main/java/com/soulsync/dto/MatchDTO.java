package com.soulsync.dto;

import com.soulsync.model.Match;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MatchDTO {
    private Long id;
    private ProfileSummaryDTO profile;   // the OTHER profile (context-dependent)
    private String status;
    private String note;
    private LocalDateTime createdAt;

    /** @param other the other member's card, already prepared for the viewer */
    public static MatchDTO of(Match m, ProfileSummaryDTO other) {
        return MatchDTO.builder()
                .id(m.getId())
                .profile(other)
                .status(m.getStatus().name())
                .note(m.getNote())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
