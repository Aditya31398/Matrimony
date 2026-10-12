package com.soulsync.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.soulsync.exception.ResourceNotFoundException;
import com.soulsync.model.Payment;
import com.soulsync.model.PremiumPlan;
import com.soulsync.model.Profile;
import com.soulsync.repository.PaymentRepository;
import com.soulsync.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;

/** Razorpay Standard Checkout: create an order, then verify the signed payment and extend premium. */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final String ORDERS_URL = "https://api.razorpay.com/v1/orders";

    private final PaymentRepository paymentRepo;
    private final ProfileRepository profileRepo;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final CacheManager cacheManager;

    @Value("${razorpay.key-id:}")
    private String keyId;

    @Value("${razorpay.key-secret:}")
    private String keySecret;

    @Value("${razorpay.webhook-secret:}")
    private String webhookSecret;

    public boolean isConfigured() {
        return !keyId.isBlank() && !keySecret.isBlank();
    }

    public String getKeyId() {
        return keyId;
    }

    public record CreatedOrder(String orderId, int amountPaise, String keyId, PremiumPlan plan,
                               String name, String email, String phone) {}

    @Transactional
    public CreatedOrder createOrder(Long profileId, PremiumPlan plan) {
        if (!isConfigured()) {
            throw new IllegalStateException("Payments are not set up yet");
        }
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", profileId));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBasicAuth(keyId, keySecret);
        Map<String, Object> body = Map.of(
                "amount", plan.getAmountPaise(),
                "currency", "INR",
                "receipt", "p" + profileId + "-" + System.currentTimeMillis(),
                "notes", Map.of("profileId", String.valueOf(profileId), "plan", plan.name()));

        JsonNode order = restTemplate.postForObject(ORDERS_URL, new HttpEntity<>(body, headers), JsonNode.class);
        if (order == null || !order.hasNonNull("id")) {
            throw new IllegalStateException("Could not create payment order");
        }
        String orderId = order.get("id").asText();

        paymentRepo.save(Payment.builder()
                .profile(profile)
                .plan(plan)
                .amountPaise(plan.getAmountPaise())
                .razorpayOrderId(orderId)
                .build());
        log.info("Created Razorpay order {} for profile {} ({})", orderId, profileId, plan);

        String name = (profile.getFirstName() + " " + Optional.ofNullable(profile.getLastName()).orElse("")).trim();
        return new CreatedOrder(orderId, plan.getAmountPaise(), keyId, plan,
                name, profile.getUser().getEmail(), profile.getPhone());
    }

    /** Called by the browser after checkout succeeds; the signature proves Razorpay issued it. */
    @Transactional
    public Profile verifyAndActivate(Long profileId, String orderId, String paymentId, String signature) {
        Payment payment = paymentRepo.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Unknown order"));
        if (!payment.getProfile().getId().equals(profileId)) {
            throw new AccessDeniedException("Order belongs to another member");
        }
        if (paymentId == null || signature == null
                || !hmacMatches(orderId + "|" + paymentId, keySecret, signature)) {
            throw new IllegalArgumentException("Payment verification failed");
        }
        return activate(payment, paymentId);
    }

    /** Server-to-server backup in case the buyer closes the tab before verification. */
    @Transactional
    public void handleWebhook(String body, String signature) {
        if (webhookSecret.isBlank()) {
            log.warn("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not set; ignoring");
            return;
        }
        if (signature == null || !hmacMatches(body, webhookSecret, signature)) {
            throw new AccessDeniedException("Invalid webhook signature");
        }
        try {
            JsonNode event = objectMapper.readTree(body);
            String type = event.path("event").asText();
            if (!"payment.captured".equals(type) && !"order.paid".equals(type)) return;
            JsonNode entity = event.path("payload").path("payment").path("entity");
            String orderId = entity.path("order_id").asText(null);
            String paymentId = entity.path("id").asText(null);
            if (orderId == null) return;
            paymentRepo.findByRazorpayOrderId(orderId).ifPresent(p -> activate(p, paymentId));
        } catch (java.io.IOException e) {
            throw new IllegalArgumentException("Malformed webhook payload");
        }
    }

    /** Idempotent: a payment already marked paid never extends premium twice. */
    private Profile activate(Payment payment, String paymentId) {
        Profile profile = payment.getProfile();
        if (payment.getStatus() == Payment.Status.PAID) return profile;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime base = profile.hasActivePremium() && profile.getPremiumUntil() != null
                ? profile.getPremiumUntil() : now;
        profile.setIsPremium(true);
        profile.setPremiumUntil(base.plusMonths(payment.getPlan().getMonths()));
        profileRepo.save(profile);

        payment.setStatus(Payment.Status.PAID);
        payment.setRazorpayPaymentId(paymentId);
        payment.setPaidAt(now);
        paymentRepo.save(payment);

        // Premium members are ranked first and see full details, so cached picks are stale
        Optional.ofNullable(cacheManager.getCache("topPicks")).ifPresent(c -> c.clear());
        log.info("Premium activated for profile {} until {}", profile.getId(), profile.getPremiumUntil());
        return profile;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expirePremium() {
        int expired = profileRepo.expirePremium(LocalDateTime.now());
        if (expired > 0) {
            log.info("Premium expired for {} profile(s)", expired);
            Optional.ofNullable(cacheManager.getCache("topPicks")).ifPresent(c -> c.clear());
        }
    }

    private static boolean hmacMatches(String payload, String secret, String expectedHex) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] actual = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] expected = HexFormat.of().parseHex(expectedHex);
            return MessageDigest.isEqual(actual, expected);
        } catch (IllegalArgumentException e) {
            return false;   // signature wasn't valid hex
        } catch (Exception e) {
            throw new IllegalStateException("Could not verify signature", e);
        }
    }
}
