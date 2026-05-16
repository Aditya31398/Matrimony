package com.soulsync.controller;

import com.soulsync.dto.MatchDTO;
import com.soulsync.service.MatchService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping
    public ResponseEntity<List<MatchDTO>> getMatches(HttpServletRequest request) {
        return ResponseEntity.ok(matchService.getMatches(currentProfileId(request)));
    }

    @GetMapping("/interested")
    public ResponseEntity<List<MatchDTO>> getInterested(HttpServletRequest request) {
        return ResponseEntity.ok(matchService.getInterested(currentProfileId(request)));
    }

    @PostMapping("/{profileId}/connect")
    public ResponseEntity<MatchDTO> connect(
            @PathVariable Long profileId,
            HttpServletRequest request) {
        return ResponseEntity.ok(matchService.sendConnect(currentProfileId(request), profileId));
    }

    @PostMapping("/{profileId}/shortlist")
    public ResponseEntity<MatchDTO> shortlist(
            @PathVariable Long profileId,
            HttpServletRequest request) {
        return ResponseEntity.ok(matchService.shortlist(currentProfileId(request), profileId));
    }

    @PutMapping("/{matchId}/accept")
    public ResponseEntity<MatchDTO> accept(
            @PathVariable Long matchId,
            HttpServletRequest request) {
        // IDOR check: only the receiver of the match may accept it
        return ResponseEntity.ok(matchService.accept(matchId, currentProfileId(request)));
    }

    @PutMapping("/{matchId}/decline")
    public ResponseEntity<MatchDTO> decline(
            @PathVariable Long matchId,
            HttpServletRequest request) {
        // IDOR check: only the receiver of the match may decline it
        return ResponseEntity.ok(matchService.decline(matchId, currentProfileId(request)));
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) throw new IllegalStateException("No authenticated profile in request");
        return profileId;
    }
}
