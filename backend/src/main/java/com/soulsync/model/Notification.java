package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications",
    indexes = @Index(name = "idx_notification_recipient", columnList = "recipient_id, is_read, created_at"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Profile recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private Profile actor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Type type;

    @Column(nullable = false, length = 300)
    private String text;

    /** Frontend route to open, e.g. /profile/12 or /messages/4 */
    @Column(length = 200)
    private String link;

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Type { INTEREST, ACCEPTED, MESSAGE }
}
