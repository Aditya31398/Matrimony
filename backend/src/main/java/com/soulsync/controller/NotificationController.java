package com.soulsync.controller;

import com.soulsync.dto.NotificationDTO;
import com.soulsync.service.NotificationService;
import com.soulsync.service.ViewerContextService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final ViewerContextService viewerContextService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> list(HttpServletRequest request) {
        return ResponseEntity.ok(notificationService.list(viewerContextService.forProfile(currentProfileId(request))));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(HttpServletRequest request) {
        return ResponseEntity.ok(Map.of("count", notificationService.unreadCount(currentProfileId(request))));
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> readAll(HttpServletRequest request) {
        notificationService.markAllRead(currentProfileId(request));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> read(@PathVariable Long id, HttpServletRequest request) {
        notificationService.markRead(id, currentProfileId(request));
        return ResponseEntity.noContent().build();
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) throw new IllegalStateException("No authenticated profile in request");
        return profileId;
    }
}
