package com.soulsync.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private static final long MAX_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "image/jpg");

    private final Cloudinary cloudinary;

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

        @SuppressWarnings("rawtypes")
        Map result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "soulsync/photos",
                "resource_type", "image"
        ));

        String url = (String) result.get("secure_url");
        log.info("Photo uploaded to Cloudinary: {}", url);
        return ResponseEntity.ok(Map.of("url", url));
    }
}
