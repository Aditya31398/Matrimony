package com.soulsync.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_MIME_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");

    private final Cloudinary cloudinary;
    private final TaskExecutor uploadExecutor;

    public UploadController(Cloudinary cloudinary,
                            @Qualifier("uploadExecutor") TaskExecutor uploadExecutor) {
        this.cloudinary = cloudinary;
        this.uploadExecutor = uploadExecutor;
    }

    @PostMapping("/photo")
    public CompletableFuture<ResponseEntity<Map<String, String>>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {

        // All validation is synchronous so we can return error responses immediately
        if (file.isEmpty()) {
            return done(ResponseEntity.badRequest().body(Map.of("message", "File is empty")));
        }
        if (file.getSize() > MAX_SIZE) {
            return done(ResponseEntity.badRequest().body(Map.of("message", "File exceeds 5 MB limit")));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            return done(ResponseEntity.badRequest().body(Map.of("message", "Only JPEG, PNG and WebP are allowed")));
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            return done(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to read file")));
        }

        if (!hasValidImageMagicBytes(bytes)) {
            return done(ResponseEntity.badRequest()
                    .body(Map.of("message", "File content does not match an allowed image format")));
        }

        Long profileId = (Long) request.getAttribute("profileId");
        String folder = "photos/" + (profileId != null ? profileId : "unknown");

        // Offload the blocking Cloudinary HTTP call to the dedicated upload thread pool,
        // freeing the servlet thread for other requests during the upload.
        return CompletableFuture.supplyAsync(() -> {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"
                ));
                String url = (String) result.get("secure_url");
                log.info("Photo uploaded for profile {}", profileId);
                return ResponseEntity.ok(Map.<String, String>of("url", url));
            } catch (IOException e) {
                log.error("Cloudinary upload failed for profile {}", profileId, e);
                return ResponseEntity.<Map<String, String>>status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Upload failed, please try again"));
            }
        }, uploadExecutor);
    }

    private static <T> CompletableFuture<T> done(T value) {
        return CompletableFuture.completedFuture(value);
    }

    private static boolean hasValidImageMagicBytes(byte[] bytes) {
        if (bytes.length < 4) return false;
        if ((bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF) return true;
        if ((bytes[0] & 0xFF) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G') return true;
        if (bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes.length >= 12
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P') return true;
        return false;
    }
}
