package com.soulsync.controller;

import com.soulsync.model.User;
import com.soulsync.repository.ProfileRepository;
import com.soulsync.repository.UserRepository;
import com.soulsync.service.EmailService;
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

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        User u = userOpt.get();
        if (!Boolean.TRUE.equals(u.getEmailVerified())) {
            return ResponseEntity.status(403).body(Map.of(
                "message", "Please verify your email address before logging in",
                "code", "EMAIL_NOT_VERIFIED"
            ));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("token", "dev-token-" + u.getId());
        resp.put("userId", u.getId());
        resp.put("message", "Login successful");
        profileRepo.findByUserId(u.getId()).ifPresent(p -> resp.put("profileId", p.getId()));
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp   = body.get("otp");

        return userRepo.findByEmail(email)
                .map(u -> {
                    if (Boolean.TRUE.equals(u.getEmailVerified())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Email already verified"));
                    }
                    if (!otp.equals(u.getVerificationToken())) {
                        return ResponseEntity.status(400)
                                .body(Map.of("message", "Incorrect OTP"));
                    }
                    if (u.getTokenExpiresAt() == null || u.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
                        return ResponseEntity.status(410)
                                .body(Map.of("message", "OTP has expired. Please request a new one."));
                    }
                    u.setEmailVerified(true);
                    u.setVerificationToken(null);
                    u.setTokenExpiresAt(null);
                    userRepo.save(u);
                    return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "No account found with that email")));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        return userRepo.findByEmail(email)
                .map(u -> {
                    if (Boolean.TRUE.equals(u.getEmailVerified())) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Email is already verified"));
                    }
                    String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
                    u.setVerificationToken(otp);
                    u.setTokenExpiresAt(LocalDateTime.now().plusMinutes(10));
                    userRepo.save(u);
                    profileRepo.findByUserId(u.getId()).ifPresent(p ->
                        emailService.sendOtpEmail(u.getEmail(), p.getFirstName(), otp)
                    );
                    return ResponseEntity.ok(Map.of("message", "OTP resent"));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("message", "No account found with that email")));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "SoulSync API"));
    }
}
