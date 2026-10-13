package com.soulsync.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.core.task.TaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableAsync
@EnableScheduling
@EnableCaching
@RequiredArgsConstructor
public class AppConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private final LastSeenInterceptor lastSeenInterceptor;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    /** Dedicated thread pool for blocking photo uploads — keeps servlet threads free. */
    @Bean(name = "uploadExecutor")
    public TaskExecutor uploadExecutor() {
        ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
        // Resizing a large photo needs ~50 MB of heap; two at a time is plenty on a 1 GB server
        exec.setCorePoolSize(2);
        exec.setMaxPoolSize(2);
        exec.setQueueCapacity(50);
        exec.setThreadNamePrefix("upload-");
        exec.initialize();
        return exec;
    }

    @Bean
    public CacheManager cacheManager() {
        // Each cache has its own TTL — stories rarely change (10 min), topPicks (5 min),
        // genderFilter per-user preference almost never changes in a session (30 min)
        SimpleCacheManager mgr = new SimpleCacheManager();
        mgr.setCaches(List.of(
                buildCache("stories",      10, TimeUnit.MINUTES),
                buildCache("topPicks",      5, TimeUnit.MINUTES),
                buildCache("genderFilter", 30, TimeUnit.MINUTES)
        ));
        return mgr;
    }

    private static CaffeineCache buildCache(String name, long duration, TimeUnit unit) {
        return new CaffeineCache(name,
                Caffeine.newBuilder().expireAfterWrite(duration, unit).maximumSize(500).build());
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Photo files get unique names and never change, so browsers may keep them for a year
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/")
                .setCacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable());
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(lastSeenInterceptor).addPathPatterns("/api/**");
    }
}
