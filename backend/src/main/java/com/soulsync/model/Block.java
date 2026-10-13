package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blocks",
    uniqueConstraints = @UniqueConstraint(columnNames = {"blocker_id", "blocked_id"}),
    indexes = @Index(name = "idx_block_blocked", columnList = "blocked_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocker_id", nullable = false)
    private Profile blocker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_id", nullable = false)
    private Profile blocked;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
