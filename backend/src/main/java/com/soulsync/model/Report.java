package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports", indexes = @Index(name = "idx_report_reported", columnList = "reported_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private Profile reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_id", nullable = false)
    private Profile reported;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Reason reason;

    @Column(length = 1000)
    private String details;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "OPEN";

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Reason { FAKE_PROFILE, INAPPROPRIATE, HARASSMENT, SCAM, ALREADY_MARRIED, OTHER }
}
