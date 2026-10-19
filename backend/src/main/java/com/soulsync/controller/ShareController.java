package com.soulsync.controller;

import com.soulsync.dto.FamilyViewDTO;
import com.soulsync.service.ShareService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ShareController {

    private final ShareService shareService;

    @PostMapping("/api/share/{profileId}")
    public ResponseEntity<Map<String, Object>> create(@PathVariable Long profileId, HttpServletRequest request) {
        Long sharerId = (Long) request.getAttribute("profileId");
        if (sharerId == null) throw new IllegalStateException("No authenticated profile in request");
        return ResponseEntity.ok(shareService.create(sharerId, profileId));
    }

    /** Public: opened by family from WhatsApp without logging in. */
    @GetMapping("/api/public/share/{token}")
    public ResponseEntity<FamilyViewDTO> view(@PathVariable String token) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("X-Robots-Tag", "noindex")
                .body(shareService.view(token));
    }
}
