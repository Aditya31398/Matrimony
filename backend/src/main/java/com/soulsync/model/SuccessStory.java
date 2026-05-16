package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "success_stories", indexes = {
    @Index(name = "idx_story_visible_created", columnList = "is_visible, created_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SuccessStory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String coupleNames;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String story;

    private LocalDate matchedDate;

    @Column(length = 500)
    private String photoUrl;

    @Builder.Default
    private Integer rating = 5;

    @Builder.Default
    private Boolean isVisible = true;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
