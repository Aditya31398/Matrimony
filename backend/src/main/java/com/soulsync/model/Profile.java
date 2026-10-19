package com.soulsync.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "profiles", indexes = {
    @Index(name = "idx_profile_gender",          columnList = "gender"),
    @Index(name = "idx_profile_city",            columnList = "city"),
    @Index(name = "idx_profile_verified",        columnList = "is_verified"),
    @Index(name = "idx_profile_premium_created", columnList = "is_premium, created_at"),
    @Index(name = "idx_profile_looking_gender",  columnList = "looking_for_gender"),
    @Index(name = "idx_profile_user",            columnList = "user_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 80)
    private String firstName;

    @Column(length = 80)
    private String lastName;

    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(length = 120)
    private String profession;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String country;

    @Column(length = 100)
    private String religion;

    @Column(length = 100)
    private String caste;

    @Column(length = 20)
    private String height;

    @Column(length = 100)
    private String motherTongue;

    @Column(length = 60)
    private String dietaryPreference;

    @Column(length = 120)
    private String education;

    // Vedic astrology — used by the horoscope matching engine
    private Integer nakshatra;   // 1–27 (Ashwini to Revati)
    private Integer rashi;       // 1–12 (Aries to Pisces); if null, derived from nakshatra
    private Boolean isManglik;

    // Optional family tradition override: ASHTAKOOTA | DASHAKOOTA; null = decide from language
    @Column(length = 20)
    private String matchingTradition;

    // Optional Papasamyam points taken from the jathakam (Kerala-style matching)
    private Integer papaPoints;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 500)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String photos;

    @Builder.Default
    private Boolean isVerified = false;

    @Builder.Default
    private Boolean isPremium = false;

    private LocalDateTime premiumUntil;

    /** When true, photos are shown only to members this profile has connected with */
    @Builder.Default
    private Boolean photoPrivate = false;

    // Interests stored as comma-separated for simplicity; a join-table can replace this
    @Column(columnDefinition = "TEXT")
    private String interests;

    @Column(columnDefinition = "TEXT")
    private String lifestyle;

    @Column(columnDefinition = "TEXT")
    private String lookingFor;

    @Column(length = 10)
    private String lookingForGender;

    private Integer ageMin;
    private Integer ageMax;

    private LocalDateTime lastSeenAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Gender { MALE, FEMALE, NON_BINARY }

    public int getAge() {
        if (dateOfBirth == null) return 0;
        return java.time.Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    /** True while a paid plan is running; isPremium alone may lag until the expiry job runs. */
    public boolean hasActivePremium() {
        return Boolean.TRUE.equals(isPremium)
                && (premiumUntil == null || premiumUntil.isAfter(LocalDateTime.now()));
    }
}
