package com.soulsync.controller;

import com.soulsync.dto.MatchDTO;
import com.soulsync.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    private static Long currentProfileId(String header) {
        try {
            if (header != null && !header.isBlank()) return Long.parseLong(header.trim());
        } catch (NumberFormatException ignored) {}
        return 1L;
    }

    @GetMapping
    public ResponseEntity<List<MatchDTO>> getMatches(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(matchService.getMatches(currentProfileId(h)));
    }

    @GetMapping("/interested")
    public ResponseEntity<List<MatchDTO>> getInterested(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(matchService.getInterested(currentProfileId(h)));
    }

    @PostMapping("/{profileId}/connect")
    public ResponseEntity<MatchDTO> connect(
            @PathVariable Long profileId,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(matchService.sendConnect(currentProfileId(h), profileId));
    }

    @PostMapping("/{profileId}/shortlist")
    public ResponseEntity<MatchDTO> shortlist(
            @PathVariable Long profileId,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(matchService.shortlist(currentProfileId(h), profileId));
    }

    @PutMapping("/{matchId}/accept")
    public ResponseEntity<MatchDTO> accept(@PathVariable Long matchId) {
        return ResponseEntity.ok(matchService.accept(matchId));
    }

    @PutMapping("/{matchId}/decline")
    public ResponseEntity<MatchDTO> decline(@PathVariable Long matchId) {
        return ResponseEntity.ok(matchService.decline(matchId));
    }
}
