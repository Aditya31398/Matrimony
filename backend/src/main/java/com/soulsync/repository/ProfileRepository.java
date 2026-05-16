package com.soulsync.repository;

import com.soulsync.model.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    Optional<Profile> findByUserId(Long userId);

    Page<Profile> findByIsVerifiedTrue(Pageable pageable);

    @Query("""
        SELECT p FROM Profile p
        WHERE (:city IS NULL OR p.city = :city)
          AND (:education IS NULL OR p.education LIKE CONCAT(:education, '%'))
          AND (:gender IS NULL OR CAST(p.gender AS string) = :gender)
        ORDER BY p.createdAt DESC
    """)
    Page<Profile> search(
            @Param("city") String city,
            @Param("education") String education,
            @Param("gender") String gender,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Profile p
        WHERE (:excludeId IS NULL OR p.id != :excludeId)
          AND (:education IS NULL OR p.education LIKE CONCAT(:education, '%'))
          AND (:gender IS NULL OR CAST(p.gender AS string) = :gender)
          AND (:verified = false OR p.isVerified = true)
        ORDER BY p.isPremium DESC, p.createdAt DESC
    """)
    Page<Profile> findWithFilters(
            @Param("excludeId") Long excludeId,
            @Param("education") String education,
            @Param("gender") String gender,
            @Param("verified") boolean verified,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Profile p
        WHERE p.id != :excludeId
          AND (:gender IS NULL OR CAST(p.gender AS string) = :gender)
        ORDER BY p.isVerified DESC, p.createdAt DESC
    """)
    List<Profile> findTopPicks(@Param("excludeId") Long excludeId, @Param("gender") String gender, Pageable pageable);

    @Query("""
        SELECT p FROM Profile p
        WHERE (:gender IS NULL OR CAST(p.gender AS string) = :gender)
        ORDER BY p.isPremium DESC, p.createdAt DESC
    """)
    List<Profile> findTopPicks(@Param("gender") String gender, Pageable pageable);
}
