package com.soulsync.repository;

import com.soulsync.model.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadFalse(Long recipientId);

    Optional<Notification> findFirstByRecipientIdAndActorIdAndTypeAndReadFalse(
            Long recipientId, Long actorId, Notification.Type type);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :id AND n.read = false")
    int markAllRead(@Param("id") Long recipientId);
}
