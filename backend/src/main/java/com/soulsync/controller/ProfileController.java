package com.soulsync.controller;

import com.soulsync.dto.ProfileDTO;
import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.dto.ProfileUpdateDTO;
import com.soulsync.dto.RegisterRequestDTO;
import com.soulsync.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<List<ProfileSummaryDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "false") boolean verified,
            @RequestHeader(name = "X-Profile-Id", required = false) String h
    ) {
        return ResponseEntity.ok(profileService.getAll(page, size, education, gender, verified, parseNullable(h)));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> getMe(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(profileService.getMe(parseProfileId(h)));
    }

    @GetMapping("/views/me")
    public ResponseEntity<List<ProfileSummaryDTO>> getViewers(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(profileService.getViewers(parseProfileId(h)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getById(
            @PathVariable Long id,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        Long viewerId = parseNullable(h);
        if (viewerId != null) profileService.recordView(viewerId, id);
        return ResponseEntity.ok(profileService.getById(id));
    }

    private static Long parseProfileId(String header) {
        try {
            if (header != null && !header.isBlank()) return Long.parseLong(header.trim());
        } catch (NumberFormatException ignored) {}
        return 1L;
    }

    private static Long parseNullable(String header) {
        try {
            if (header != null && !header.isBlank()) return Long.parseLong(header.trim());
        } catch (NumberFormatException ignored) {}
        return null;
    }

    @GetMapping("/top-picks")
    public ResponseEntity<List<ProfileSummaryDTO>> getTopPicks(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(profileService.getTopPicks(parseNullable(h)));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfileSummaryDTO>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(profileService.search(city, education, gender, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileDTO> update(
            @PathVariable Long id,
            @RequestBody ProfileUpdateDTO req) {
        return ResponseEntity.ok(profileService.update(id, req));
    }

    @PostMapping
    public ResponseEntity<ProfileDTO> register(@Valid @RequestBody RegisterRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.register(req));
    }
}
