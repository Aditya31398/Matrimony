package com.soulsync.repository;

import com.soulsync.model.SuccessStory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SuccessStoryRepository extends JpaRepository<SuccessStory, Long> {

    Page<SuccessStory> findByIsVisibleTrue(Pageable pageable);
}
