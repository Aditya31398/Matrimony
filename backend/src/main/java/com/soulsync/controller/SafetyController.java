package com.soulsync.controller;

import com.soulsync.dto.ProfileSummaryDTO;
import com.soulsync.model.Report;
import com.soulsync.service.SafetyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SafetyController {

    private final SafetyService safetyService;

    @PostMapping("/profiles/{id}/block")
    public ResponseEntity<Map<String, String>> block(@PathVariable Long id, HttpServletRequest request) {
        safetyService.block(currentProfileId(request), id);
        return ResponseEntity.ok(Map.of("message", "Blocked"));
    }

    @DeleteMapping("/profiles/{id}/block")
    public ResponseEntity<Map<String, String>> unblock(@PathVariable Long id, HttpServletRequest request) {
        safetyService.unblock(currentProfileId(request), id);
        return ResponseEntity.ok(Map.of("message", "Unblocked"));
    }

    @GetMapping("/blocks")
    public ResponseEntity<List<ProfileSummaryDTO>> blocked(HttpServletRequest request) {
        return ResponseEntity.ok(safetyService.blocked(currentProfileId(request)));
    }

    /** Body: { reason: FAKE_PROFILE|INAPPROPRIATE|HARASSMENT|SCAM|ALREADY_MARRIED|OTHER, details?, block? } */
    @PostMapping("/profiles/{id}/report")
    public ResponseEntity<Map<String, String>> report(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        String raw = String.valueOf(body.getOrDefault("reason", ""));
        Report.Reason reason = Arrays.stream(Report.Reason.values())
                .filter(r -> r.name().equalsIgnoreCase(raw))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Please choose a reason"));
        Object details = body.get("details");
        boolean alsoBlock = Boolean.TRUE.equals(body.get("block"));
        safetyService.report(currentProfileId(request), id, reason, details == null ? null : details.toString(), alsoBlock);
        return ResponseEntity.ok(Map.of("message", "Thanks — our team will review this profile"));
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) throw new IllegalStateException("No authenticated profile in request");
        return profileId;
    }
}
