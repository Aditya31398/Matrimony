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

    @Query("SELECT DISTINCT c FROM Conversation c LEFT JOIN FETCH c.messages WHERE c.profile1 = :p OR c.profile2 = :p")
    List<Conversation> findByProfile(@Param("p") Profile p);

    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.profile1 = :p1 AND c.profile2 = :p2)
           OR (c.profile1 = :p2 AND c.profile2 = :p1)
    """)
    Optional<Conversation> findByProfiles(@Param("p1") Profile p1, @Param("p2") Profile p2);
}
