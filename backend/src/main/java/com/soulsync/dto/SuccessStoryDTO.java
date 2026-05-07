package com.soulsync.dto;

import com.soulsync.model.SuccessStory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SuccessStoryDTO {
    private Long id;
    private String coupleNames;
    private String story;
    private String matchedDate;
    private String photoUrl;
    private Integer rating;

    public static SuccessStoryDTO from(SuccessStory s) {
        return SuccessStoryDTO.builder()
                .id(s.getId())
                .coupleNames(s.getCoupleNames())
                .story(s.getStory())
                .matchedDate(s.getMatchedDate() != null ? s.getMatchedDate().toString() : null)
                .photoUrl(s.getPhotoUrl())
                .rating(s.getRating())
                .build();
    }
}
