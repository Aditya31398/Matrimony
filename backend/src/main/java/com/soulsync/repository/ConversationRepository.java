package com.soulsync.repository;

import com.soulsync.model.Conversation;
import com.soulsync.model.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Fetches both participant profiles eagerly (eliminates N+1) and sorts by
     * lastMessageAt descending so no in-memory sort is needed. Messages are
     * NOT loaded here — use the denormalized fields + a separate unread COUNT.
     */
    @Query("""
        SELECT c FROM Conversation c
        JOIN FETCH c.profile1
        JOIN FETCH c.profile2
        WHERE c.profile1 = :p OR c.profile2 = :p
        ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC
    """)
    List<Conversation> findByProfile(@Param("p") Profile p);

    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.profile1 = :p1 AND c.profile2 = :p2)
           OR (c.profile1 = :p2 AND c.profile2 = :p1)
    """)
    Optional<Conversation> findByProfiles(@Param("p1") Profile p1, @Param("p2") Profile p2);
}
