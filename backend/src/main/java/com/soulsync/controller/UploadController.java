package com.soulsync.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final java.util.Set<String> ALLOWED_TYPES =
            java.util.Set.of("image/jpeg", "image/png", "image/webp", "image/jpg");

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostMapping("/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestParam("file") MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        if (file.getSize() > MAX_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "File exceeds 5 MB limit"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only JPEG, PNG and WebP are allowed"));
        }

        String ext = contentType.contains("png") ? ".png" : contentType.contains("webp") ? ".webp" : ".jpg";
        String filename = UUID.randomUUID().toString().replace("-", "") + ext;

        Path photosDir = Paths.get(uploadDir, "photos");
        Files.createDirectories(photosDir);
        Files.copy(file.getInputStream(), photosDir.resolve(filename));

        String url = "/uploads/photos/" + filename;
        log.info("Photo uploaded: {}", url);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
