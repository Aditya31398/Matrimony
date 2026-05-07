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
    private LocalDateTime createdAt;

    public static MatchDTO fromReceived(Match m) {
        return MatchDTO.builder()
                .id(m.getId())
                .profile(ProfileSummaryDTO.from(m.getSenderProfile()))
                .status(m.getStatus().name())
                .createdAt(m.getCreatedAt())
                .build();
    }

    public static MatchDTO fromSent(Match m) {
        return MatchDTO.builder()
                .id(m.getId())
                .profile(ProfileSummaryDTO.from(m.getReceiverProfile()))
                .status(m.getStatus().name())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
