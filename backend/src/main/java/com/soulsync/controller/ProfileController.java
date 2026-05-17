package com.soulsync.controller;

import com.soulsync.dto.ProfileDTO;
import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.dto.ProfileUpdateDTO;
import com.soulsync.dto.RegisterRequestDTO;
import com.soulsync.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<Page<ProfileSummaryDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "false") boolean verified,
            @RequestParam(required = false) String sort,     // "recent" | null (default = recommended)
            @RequestParam(required = false) String city,     // filter by exact city (near_me chip)
            @RequestParam(required = false) String interest,  // filter by shared interest tag
            HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        return ResponseEntity.ok(profileService.getAll(page, size, education, gender, verified, sort, city, interest, profileId));
    }

    @GetMapping("/me")
    public ResponseEntity<ProfileDTO> getMe(HttpServletRequest request) {
        return ResponseEntity.ok(profileService.getMe(currentProfileId(request)));
    }

    @GetMapping("/views/me")
    public ResponseEntity<List<ProfileSummaryDTO>> getViewers(HttpServletRequest request) {
        return ResponseEntity.ok(profileService.getViewers(currentProfileId(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProfileDTO> getById(
            @PathVariable Long id,
            HttpServletRequest request) {
        Long viewerId = (Long) request.getAttribute("profileId");
        if (viewerId != null) profileService.recordView(viewerId, id);
        return ResponseEntity.ok(profileService.getById(id));
    }

    @GetMapping("/top-picks")
    public ResponseEntity<List<ProfileSummaryDTO>> getTopPicks(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        return ResponseEntity.ok(profileService.getTopPicks(profileId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfileSummaryDTO>> search(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String gender,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(profileService.search(city, education, gender, page, size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfileDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ProfileUpdateDTO req,
            HttpServletRequest request) {
        Long profileId = currentProfileId(request);
        // IDOR check: users may only update their own profile
        if (!id.equals(profileId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(profileService.update(id, req));
    }

    @PostMapping
    public ResponseEntity<ProfileDTO> register(@Valid @RequestBody RegisterRequestDTO req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(profileService.register(req));
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) {
            throw new IllegalStateException("No authenticated profile in request");
        }
        return profileId;
    }
}
