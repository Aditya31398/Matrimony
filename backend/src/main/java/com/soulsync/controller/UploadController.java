package com.soulsync.controller;

import jakarta.servlet.http.HttpServletRequest;
import net.coobird.thumbnailator.Thumbnails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final long MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final Set<String> ALLOWED_MIME_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    /** Longest edge stored; enough for a full-screen profile photo on a retina phone. */
    private static final int MAX_DIMENSION = 1400;
    /** Below this size a reasonably sized photo is stored as uploaded. */
    private static final int KEEP_ORIGINAL_BYTES = 400 * 1024;

    private final Path uploadRoot;
    private final TaskExecutor uploadExecutor;

    public UploadController(@Value("${app.upload.dir:uploads}") String uploadDir,
                            @Qualifier("uploadExecutor") TaskExecutor uploadExecutor) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
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

        // Large JPEG/PNG photos are re-encoded as a smaller JPEG (WebP has no built-in decoder)
        boolean shrink = needsShrinking(bytes, contentType);
        Long profileId = (Long) request.getAttribute("profileId");
        String relativePath = "photos/" + (profileId != null ? profileId : "unknown")
                + "/" + UUID.randomUUID() + (shrink ? ".jpg" : extensionFor(contentType));
        // Resolve the public URL on the request thread (request context is unavailable in the pool)
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/" + relativePath)
                .toUriString();

        // Offload the blocking disk write to the dedicated upload thread pool,
        // freeing the servlet thread for other requests during the upload.
        return CompletableFuture.supplyAsync(() -> {
            try {
                Path target = uploadRoot.resolve(relativePath);
                Files.createDirectories(target.getParent());
                Files.write(target, shrink ? shrink(bytes) : bytes);
                log.info("Photo uploaded for profile {}", profileId);
                return ResponseEntity.ok(Map.<String, String>of("url", url));
            } catch (IOException e) {
                log.error("Photo upload failed for profile {}", profileId, e);
                return ResponseEntity.<Map<String, String>>status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Upload failed, please try again"));
            }
        }, uploadExecutor);
    }

    static boolean needsShrinking(byte[] bytes, String contentType) {
        if (contentType.equalsIgnoreCase("image/webp")) return false;
        if (bytes.length > KEEP_ORIGINAL_BYTES) return true;
        // Read only the header to get dimensions; decoding the whole image here isn't needed
        try (ImageInputStream in = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) return false;
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                return Math.max(reader.getWidth(0), reader.getHeight(0)) > MAX_DIMENSION;
            } finally {
                reader.dispose();
            }
        } catch (IOException e) {
            return false;
        }
    }

    /** Fit within MAX_DIMENSION as a quality-82 JPEG; keeps the original if anything goes wrong. */
    static byte[] shrink(byte[] bytes) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Thumbnails.of(new ByteArrayInputStream(bytes))
                    .size(MAX_DIMENSION, MAX_DIMENSION)
                    .outputFormat("jpg")
                    .outputQuality(0.82)
                    .toOutputStream(out);
            return out.toByteArray();
        } catch (IOException | RuntimeException e) {
            log.warn("Could not resize photo, storing original: {}", e.getMessage());
            return bytes;
        }
    }

    private static String extensionFor(String contentType) {
        return switch (contentType.toLowerCase()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
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
