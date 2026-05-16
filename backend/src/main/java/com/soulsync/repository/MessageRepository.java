package com.soulsync.repository;

import com.soulsync.model.Conversation;
import com.soulsync.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /** All messages in a conversation, oldest-first (message detail view). */
    List<Message> findByConversationOrderBySentAtAsc(Conversation conversation);

    /** Paginated variant for large conversations. */
    Page<Message> findByConversationOrderBySentAtAsc(Conversation conversation, Pageable pageable);

    /** COUNT unread messages in a conversation not sent by the viewer — avoids loading message objects. */
    @Query("""
        SELECT COUNT(m) FROM Message m
        WHERE m.conversation = :conv
          AND m.senderProfile.id != :profileId
          AND m.isRead = false
    """)
    long countUnread(@Param("conv") Conversation conv, @Param("profileId") Long profileId);
}
