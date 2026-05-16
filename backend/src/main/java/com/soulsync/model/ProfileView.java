package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "profile_views",
       uniqueConstraints = @UniqueConstraint(name = "uq_viewer_viewed", columnNames = {"viewer_id", "viewed_id"}),
       indexes = {
           @Index(name = "idx_view_viewed_at", columnList = "viewed_id, viewed_at")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProfileView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewer_id", nullable = false)
    private Profile viewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "viewed_id", nullable = false)
    private Profile viewed;

    @Column(nullable = false)
    private LocalDateTime viewedAt;
}
