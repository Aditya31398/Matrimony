package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** Read-only, expiring link that lets family view a profile without an account. */
@Entity
@Table(name = "share_links")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharer_id", nullable = false)
    private Profile sharer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private Integer viewCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
