package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_profile", columnList = "profile_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PremiumPlan plan;

    @Column(nullable = false)
    private Integer amountPaise;

    @Column(nullable = false, unique = true, length = 40)
    private String razorpayOrderId;

    @Column(length = 40)
    private String razorpayPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private Status status = Status.CREATED;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public enum Status { CREATED, PAID }
}
