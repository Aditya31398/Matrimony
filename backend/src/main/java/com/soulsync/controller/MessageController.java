package com.soulsync.controller;

import com.soulsync.dto.ConversationDTO;
import com.soulsync.dto.MessageDTO;
import com.soulsync.service.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private static final int MAX_MESSAGE_LENGTH = 2000;
    private final MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(HttpServletRequest request) {
        return ResponseEntity.ok(messageService.getConversations(currentProfileId(request)));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Long id,
            HttpServletRequest request) {
        // Ownership check inside service — verifies caller is a participant
        return ResponseEntity.ok(messageService.getMessages(id, currentProfileId(request)));
    }

    @PostMapping("/conversations/{id}")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (content.length() > MAX_MESSAGE_LENGTH) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(null);
        }
        // Ownership check inside service — verifies caller is a participant
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(id, currentProfileId(request), content));
    }

    @GetMapping("/conversations/{id}/icebreakers")
    public ResponseEntity<List<Map<String, Object>>> getIcebreakers(
            @PathVariable Long id,
            HttpServletRequest request) {
        // Verify participant before exposing icebreakers
        messageService.assertParticipant(id, currentProfileId(request));
        return ResponseEntity.ok(messageService.getIcebreakers(id));
    }

    @PostMapping("/conversations/start/{otherProfileId}")
    public ResponseEntity<ConversationDTO> startConversation(
            @PathVariable Long otherProfileId,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.getOrCreateConversation(currentProfileId(request), otherProfileId));
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) throw new IllegalStateException("No authenticated profile in request");
        return profileId;
    }
}
