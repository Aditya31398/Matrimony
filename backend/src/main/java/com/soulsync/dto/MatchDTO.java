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
        return fromReceived(m, true);
    }

    public static MatchDTO fromReceived(Match m, boolean viewerIsPremium) {
        return MatchDTO.builder()
                .id(m.getId())
                .profile(ProfileSummaryDTO.from(m.getSenderProfile(), viewerIsPremium))
                .status(m.getStatus().name())
                .createdAt(m.getCreatedAt())
                .build();
    }

    public static MatchDTO fromSent(Match m) {
        return fromSent(m, true);
    }

    public static MatchDTO fromSent(Match m, boolean viewerIsPremium) {
        return MatchDTO.builder()
                .id(m.getId())
                .profile(ProfileSummaryDTO.from(m.getReceiverProfile(), viewerIsPremium))
                .status(m.getStatus().name())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
