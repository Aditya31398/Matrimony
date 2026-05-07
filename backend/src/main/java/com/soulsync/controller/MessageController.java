package com.soulsync.controller;

import com.soulsync.dto.ConversationDTO;
import com.soulsync.dto.MessageDTO;
import com.soulsync.service.MessageService;
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

    private final MessageService messageService;

    private static Long currentProfileId(String header) {
        try {
            if (header != null && !header.isBlank()) return Long.parseLong(header.trim());
        } catch (NumberFormatException ignored) {}
        return 1L;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getConversations(
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(messageService.getConversations(currentProfileId(h)));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<List<MessageDTO>> getMessages(
            @PathVariable Long id,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.ok(messageService.getMessages(id, currentProfileId(h)));
    }

    @PostMapping("/conversations/{id}")
    public ResponseEntity<MessageDTO> sendMessage(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.sendMessage(id, currentProfileId(h), content));
    }

    @GetMapping("/conversations/{id}/icebreakers")
    public ResponseEntity<List<Map<String, Object>>> getIcebreakers(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getIcebreakers(id));
    }

    @PostMapping("/conversations/start/{otherProfileId}")
    public ResponseEntity<ConversationDTO> startConversation(
            @PathVariable Long otherProfileId,
            @RequestHeader(name = "X-Profile-Id", required = false) String h) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.getOrCreateConversation(currentProfileId(h), otherProfileId));
    }
}
