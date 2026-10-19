package com.soulsync.repository;

import com.soulsync.model.Match;
import com.soulsync.model.Profile;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    @EntityGraph("Match.withProfiles")
    List<Match> findBySenderProfileAndStatus(Profile sender, Match.Status status);

    @EntityGraph("Match.withProfiles")
    List<Match> findByReceiverProfileAndStatus(Profile receiver, Match.Status status);

    Optional<Match> findBySenderProfileAndReceiverProfile(Profile sender, Profile receiver);

    @EntityGraph("Match.withProfiles")
    @Query("""
        SELECT m FROM Match m
        WHERE (m.senderProfile = :profile OR m.receiverProfile = :profile)
          AND m.status = 'ACCEPTED'
    """)
    List<Match> findAcceptedMatches(@Param("profile") Profile profile);

    /** Ids of everyone the profile is connected with (accepted either way). */
    @Query("""
        SELECT CASE WHEN m.senderProfile.id = :id THEN m.receiverProfile.id ELSE m.senderProfile.id END
        FROM Match m
        WHERE (m.senderProfile.id = :id OR m.receiverProfile.id = :id) AND m.status = 'ACCEPTED'
    """)
    List<Long> findConnectedIds(@Param("id") Long profileId);

    /** Ids the profile has any request/match history with (not counting private shortlists). */
    @Query("""
        SELECT CASE WHEN m.senderProfile.id = :id THEN m.receiverProfile.id ELSE m.senderProfile.id END
        FROM Match m
        WHERE (m.senderProfile.id = :id OR m.receiverProfile.id = :id) AND m.status <> 'SHORTLISTED'
    """)
    List<Long> findInteractedIds(@Param("id") Long profileId);
}
