package com.soulsync.repository;

import com.soulsync.model.Profile;
import com.soulsync.model.ProfileView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileViewRepository extends JpaRepository<ProfileView, Long> {

    Optional<ProfileView> findByViewerAndViewed(Profile viewer, Profile viewed);

    @Query("SELECT v FROM ProfileView v WHERE v.viewed = :viewed ORDER BY v.viewedAt DESC")
    List<ProfileView> findViewers(@Param("viewed") Profile viewed, Pageable pageable);
}
