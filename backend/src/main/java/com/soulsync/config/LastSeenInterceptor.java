package com.soulsync.config;

import com.soulsync.repository.ProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class LastSeenInterceptor implements HandlerInterceptor {

    private final ProfileRepository profileRepo;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String header = request.getHeader("X-Profile-Id");
        if (header == null || header.isBlank()) return true;
        try {
            Long profileId = Long.parseLong(header.trim());
            profileRepo.findById(profileId).ifPresent(p -> {
                p.setLastSeenAt(LocalDateTime.now());
                profileRepo.save(p);
            });
        } catch (Exception ignored) {}
        return true;
    }
}
