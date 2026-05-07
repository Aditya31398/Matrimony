package com.soulsync.controller;

import com.soulsync.dto.SuccessStoryDTO;
import com.soulsync.service.SuccessStoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class SuccessStoryController {

    private final SuccessStoryService storyService;

    @GetMapping
    public ResponseEntity<List<SuccessStoryDTO>> getAll() {
        return ResponseEntity.ok(storyService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessStoryDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(storyService.getById(id));
    }
}
