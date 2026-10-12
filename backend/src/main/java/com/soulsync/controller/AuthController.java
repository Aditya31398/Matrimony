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

    private static final int MAX_RESET_ATTEMPTS = 5;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("login:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = trimmed(body.get("email"));
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

        String email = trimmed(body.get("email"));
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

        String email = trimmed(body.get("email"));
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

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("forgot:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = trimmed(body.get("email"));
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(400).body(Map.of("message", "Email is required"));
        }

        userRepo.findByEmail(email).ifPresent(u -> {
            String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
            // Store hashed OTP
            u.setResetToken(passwordEncoder.encode(otp));
            u.setResetTokenExpiresAt(LocalDateTime.now().plusMinutes(10));
            u.setResetAttempts(0);
            userRepo.save(u);
            String name = profileRepo.findByUserId(u.getId()).map(p -> p.getFirstName()).orElse("there");
            emailService.sendPasswordResetEmail(u.getEmail(), name, otp);
        });

        // Same response whether or not the account exists, to prevent email enumeration
        return ResponseEntity.ok(Map.of("message", "If that email is registered, a reset code has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String clientIp = getClientIp(request);
        if (!rateLimiter.isAllowed("reset:" + clientIp)) {
            return ResponseEntity.status(429).body(Map.of("message", "Too many attempts. Please try again later."));
        }

        String email = trimmed(body.get("email"));
        String otp = body.get("otp");
        String newPassword = body.get("newPassword");

        if (email == null || otp == null || otp.isBlank() || newPassword == null) {
            return ResponseEntity.status(400).body(Map.of("message", "Email, code and new password are required"));
        }
        if (newPassword.length() < 8 || newPassword.length() > 128) {
            return ResponseEntity.status(400).body(Map.of("message", "Password must be 8–128 characters"));
        }

        var invalid = ResponseEntity.status(400).body(Map.of("message", "Incorrect or expired code"));

        return userRepo.findByEmail(email)
                .map(u -> {
                    if (u.getResetToken() == null || u.getResetTokenExpiresAt() == null
                            || u.getResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
                        return invalid;
                    }
                    if (!passwordEncoder.matches(otp, u.getResetToken())) {
                        int attempts = (u.getResetAttempts() == null ? 0 : u.getResetAttempts()) + 1;
                        // Burn the code after 5 wrong guesses so it can't be brute-forced
                        if (attempts >= MAX_RESET_ATTEMPTS) {
                            u.setResetToken(null);
                            u.setResetTokenExpiresAt(null);
                        }
                        u.setResetAttempts(attempts);
                        userRepo.save(u);
                        return invalid;
                    }
                    u.setPasswordHash(passwordEncoder.encode(newPassword));
                    u.setResetToken(null);
                    u.setResetTokenExpiresAt(null);
                    u.setResetAttempts(0);
                    // Receiving the code proves they own the inbox
                    u.setEmailVerified(true);
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
                })
                .orElse(invalid);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "SoulSync API"));
    }

    /** Phone keyboards often add a trailing space to emails. */
    private static String trimmed(String email) {
        return email == null ? null : email.trim();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
