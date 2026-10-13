package com.soulsync.repository;

import com.soulsync.model.Block;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockRepository extends JpaRepository<Block, Long> {

    Optional<Block> findByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    List<Block> findByBlockerIdOrderByCreatedAtDesc(Long blockerId);

    /** Everyone hidden from this profile: people it blocked and people who blocked it. */
    @Query("""
        SELECT CASE WHEN b.blocker.id = :id THEN b.blocked.id ELSE b.blocker.id END
        FROM Block b WHERE b.blocker.id = :id OR b.blocked.id = :id
    """)
    List<Long> findHiddenIds(@Param("id") Long profileId);
}
