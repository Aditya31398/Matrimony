package com.soulsync.service;

import com.soulsync.dto.SuccessStoryDTO;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.repository.SuccessStoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuccessStoryService {

    private final SuccessStoryRepository storyRepo;

    @Transactional(readOnly = true)
    public List<SuccessStoryDTO> getAll() {
        return storyRepo.findByIsVisibleTrueOrderByCreatedAtDesc()
                .stream()
                .map(SuccessStoryDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SuccessStoryDTO getById(Long id) {
        return storyRepo.findById(id)
                .map(SuccessStoryDTO::from)
                .orElseThrow(() -> new ResourceNotFoundException("Story", id));
    }
}
