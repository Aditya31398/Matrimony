package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_conv_profile1",      columnList = "profile1_id"),
    @Index(name = "idx_conv_profile2",      columnList = "profile2_id"),
    @Index(name = "idx_conv_last_msg",      columnList = "last_message_at")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile1_id", nullable = false)
    private Profile profile1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile2_id", nullable = false)
    private Profile profile2;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    /** Denormalized: updated on every new message to avoid loading all messages for sorting. */
    private LocalDateTime lastMessageAt;

    @Column(length = 80)
    private String lastMessagePreview;

    private Long lastSenderId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
