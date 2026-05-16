package com.soulsync.controller;

import com.soulsync.model.User;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.UserRepository;
import com.soulsync.security.JwtService;
import com.soulsync.security.RateLimitService;
import com.soulsync.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepo;
    private final ProfileRepository profileRepo;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final RateLimitService rateLimiter;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("login:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Email and password are required"));
        }

        var userOpt = userRepo.findByEmail(email);
        // Use same error for wrong email or wrong password to prevent user enumeration
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        User u = userOpt.get();
        if (!Boolean.TRUE.equals(u.getEmailVerified())) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Please verify your email address before logging in",
                "code", "EMAIL_NOT_VERIFIED"
            ));
        }

        var profileOpt = profileRepo.findByUserId(u.getId());
        Long profileId = profileOpt.map(p -> p.getId()).orElse(null);
        String tenantId = "default"; // TODO: derive from profile's tenant once tenant model is added

        String token = jwtService.generateToken(u.getId(), profileId, tenantId);

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", token);
        resp.put("userId", u.getId());
        resp.put("message", "Login successful");
        profileOpt.ifPresent(p -> resp.put("profileId", p.getId()));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("otp:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = body.get("email");
        String otp   = body.get("otp");

        if (email == null || otp == null || otp.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "Email and OTP are required"));
        }

        return userRepo.findByEmail(email)
                .map(u -> {
                    if (Boolean.TRUE.equals(u.getEmailVerified())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Email already verified"));
                    }
                    if (u.getTokenExpiresAt() == null || u.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.status(410)
                                .body(Map.of("message", "OTP has expired. Please request a new one."));
                    }
                    // Compare against hashed OTP stored in DB
                    if (u.getVerificationToken() == null ||
                            !passwordEncoder.matches(otp, u.getVerificationToken())) {
                        return ResponseEntity.status(400)
                                .body(Map.of("message", "Incorrect OTP"));
                    }
                    u.setEmailVerified(true);
                    u.setVerificationToken(null);
                    u.setTokenExpiresAt(null);
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
                })
                // Generic message to prevent email enumeration
                .orElse(ResponseEntity.status(400).body(Map.of("message", "Invalid request")));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("otp:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = body.get("email");
        if (email == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Email is required"));
        }

        return userRepo.findByEmail(email)
                .map(u -> {
                    if (Boolean.TRUE.equals(u.getEmailVerified())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Email is already verified"));
                    }
                    String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
                    // Store hashed OTP
                    u.setVerificationToken(passwordEncoder.encode(otp));
                    u.setTokenExpiresAt(LocalDateTime.now().plusMinutes(10));
                    userRepo.save(u);
                    profileRepo.findByUserId(u.getId()).ifPresent(p ->
                        emailService.sendOtpEmail(u.getEmail(), p.getFirstName(), otp)
                    );
                    return ResponseEntity.ok(Map.of("message", "OTP resent"));
                })
                // Generic response to prevent email enumeration
                .orElse(ResponseEntity.ok(Map.of("message", "If that email exists, an OTP has been sent")));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "SoulSync API"));
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
