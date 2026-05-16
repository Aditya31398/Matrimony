package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@NamedEntityGraph(
    name = "Match.withProfiles",
    attributeNodes = {
        @NamedAttributeNode("senderProfile"),
        @NamedAttributeNode("receiverProfile")
    }
)
@Entity
@Table(
    name = "matches",
    uniqueConstraints = @UniqueConstraint(columnNames = {"sender_profile_id", "receiver_profile_id"}),
    indexes = {
        @Index(name = "idx_match_receiver_status", columnList = "receiver_profile_id, status"),
        @Index(name = "idx_match_sender",          columnList = "sender_profile_id"),
        @Index(name = "idx_match_status",          columnList = "status")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_profile_id", nullable = false)
    private Profile senderProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_profile_id", nullable = false)
    private Profile receiverProfile;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status { PENDING, ACCEPTED, DECLINED, SHORTLISTED }
}
