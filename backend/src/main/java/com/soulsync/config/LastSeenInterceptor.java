package com.soulsync.config;

import com.soulsync.repository.ProfileRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
public class LastSeenInterceptor implements HandlerInterceptor {

    private static final long DEBOUNCE_SECONDS = 60;

    private final ProfileRepository profileRepo;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        Object attr = request.getAttribute("profileId");
        if (attr == null) return true;
        try {
            Long profileId = (Long) attr;
            profileRepo.findById(profileId).ifPresent(p -> {
                LocalDateTime now = LocalDateTime.now();
                // Skip the write if we updated within the last 60 seconds — avoids a DB write on every polled request
                if (p.getLastSeenAt() == null
                        || ChronoUnit.SECONDS.between(p.getLastSeenAt(), now) > DEBOUNCE_SECONDS) {
                    p.setLastSeenAt(now);
                    profileRepo.save(p);
                }
            });
        } catch (Exception ignored) {}
        return true;
    }
}
