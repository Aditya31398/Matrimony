package com.soulsync.repository;

import com.soulsync.dto.ProfileFilter;
import com.soulsync.model.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUserId(Long userId);

    /** Clears the premium flag on plans that have run out, so ranking stops favouring them. */
    @Modifying
    @Query("UPDATE Profile p SET p.isPremium = false WHERE p.isPremium = true AND p.premiumUntil < :now")
    int expirePremium(@Param("now") LocalDateTime now);

    Page<Profile> findByIsVerifiedTrue(Pageable pageable);

    @Query("""
        SELECT p FROM Profile p
        WHERE p.id NOT IN :excluded
          AND (:city IS NULL OR p.city = :city)
          AND (:education IS NULL OR p.education LIKE CONCAT(:education, '%'))
          AND (:gender IS NULL OR CAST(p.gender AS string) = :gender)
        ORDER BY p.createdAt DESC
    """)
    Page<Profile> search(
            @Param("excluded") Collection<Long> excluded,
            @Param("city") String city,
            @Param("education") String education,
            @Param("gender") String gender,
            Pageable pageable
    );

    /** {@code excluded} must be non-empty: the viewer plus anyone blocked either way. */
    @Query("""
        SELECT p FROM Profile p
        WHERE p.id NOT IN :excluded
          AND (:#{#f.gender} IS NULL OR CAST(p.gender AS string) = :#{#f.gender})
          AND (:#{#f.verified} = false OR p.isVerified = true)
          AND (:#{#f.city} IS NULL OR p.city = :#{#f.city})
          AND (:#{#f.interest} IS NULL OR p.interests LIKE CONCAT('%', :#{#f.interest}, '%'))
          AND (:#{#f.education} IS NULL OR p.education LIKE CONCAT(:#{#f.education}, '%'))
          AND (:#{#f.bornOnOrBefore} IS NULL OR p.dateOfBirth <= :#{#f.bornOnOrBefore})
          AND (:#{#f.bornAfter} IS NULL OR p.dateOfBirth > :#{#f.bornAfter})
          AND (:#{#f.religion} IS NULL OR p.religion = :#{#f.religion})
          AND (:#{#f.caste} IS NULL OR LOWER(p.caste) LIKE LOWER(CONCAT('%', :#{#f.caste}, '%')))
          AND (:#{#f.motherTongue} IS NULL OR p.motherTongue = :#{#f.motherTongue})
          AND (:#{#f.location} IS NULL OR LOWER(p.city) = LOWER(:#{#f.location}) OR LOWER(p.state) = LOWER(:#{#f.location}))
          AND (:#{#f.diet} IS NULL OR p.dietaryPreference = :#{#f.diet})
          AND (:#{#f.manglik} IS NULL OR p.isManglik = :#{#f.manglik})
          AND (:#{#f.withPhoto} = false OR (p.photoUrl IS NOT NULL AND (p.photoPrivate IS NULL OR p.photoPrivate = false)))
    """)
    Page<Profile> findWithFilters(
            @Param("excluded") Collection<Long> excluded,
            @Param("f") ProfileFilter f,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Profile p
        WHERE p.id NOT IN :excluded
          AND (:gender IS NULL OR CAST(p.gender AS string) = :gender)
        ORDER BY p.isVerified DESC, p.createdAt DESC
    """)
    List<Profile> findTopPicks(@Param("excluded") Collection<Long> excluded, @Param("gender") String gender, Pageable pageable);

}
