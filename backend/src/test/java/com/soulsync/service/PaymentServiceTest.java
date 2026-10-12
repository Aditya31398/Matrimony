package com.soulsync.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.soulsync.model.Payment;
import com.soulsync.model.PremiumPlan;
import com.soulsync.model.Profile;
import com.soulsync.repository.PaymentRepository;
import com.soulsync.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    private static final String SECRET = "test_secret";

    private PaymentRepository paymentRepo;
    private PaymentService service;
    private Profile profile;
    private Payment payment;

    @BeforeEach
    void setUp() {
        paymentRepo = mock(PaymentRepository.class);
        ProfileRepository profileRepo = mock(ProfileRepository.class);
        service = new PaymentService(paymentRepo, profileRepo, new RestTemplate(), new ObjectMapper(),
                new ConcurrentMapCacheManager("topPicks"));
        ReflectionTestUtils.setField(service, "keyId", "rzp_test_x");
        ReflectionTestUtils.setField(service, "keySecret", SECRET);
        ReflectionTestUtils.setField(service, "webhookSecret", "hook_secret");

        profile = Profile.builder().id(7L).firstName("A").isPremium(false).build();
        payment = Payment.builder().profile(profile).plan(PremiumPlan.MONTH_3)
                .amountPaise(129_900).razorpayOrderId("order_1").build();
        when(paymentRepo.findByRazorpayOrderId("order_1")).thenReturn(Optional.of(payment));
    }

    @Test
    void validSignatureActivatesPremiumForPlanLength() {
        service.verifyAndActivate(7L, "order_1", "pay_1", hmac("order_1|pay_1", SECRET));
        assertTrue(profile.hasActivePremium());
        assertTrue(profile.getPremiumUntil().isAfter(LocalDateTime.now().plusMonths(3).minusMinutes(1)));
        assertEquals(Payment.Status.PAID, payment.getStatus());
    }

    @Test
    void renewalExtendsFromCurrentExpiry() {
        LocalDateTime until = LocalDateTime.now().plusDays(10);
        profile.setIsPremium(true);
        profile.setPremiumUntil(until);
        service.verifyAndActivate(7L, "order_1", "pay_1", hmac("order_1|pay_1", SECRET));
        assertEquals(until.plusMonths(3), profile.getPremiumUntil());
    }

    @Test
    void tamperedSignatureIsRejected() {
        assertThrows(IllegalArgumentException.class,
                () -> service.verifyAndActivate(7L, "order_1", "pay_1", hmac("order_1|pay_2", SECRET)));
        assertThrows(IllegalArgumentException.class,
                () -> service.verifyAndActivate(7L, "order_1", "pay_1", "not-hex"));
        assertFalse(profile.hasActivePremium());
    }

    @Test
    void anotherMembersOrderIsRejected() {
        assertThrows(AccessDeniedException.class,
                () -> service.verifyAndActivate(8L, "order_1", "pay_1", hmac("order_1|pay_1", SECRET)));
    }

    @Test
    void paymentIsOnlyCountedOnce() {
        String sig = hmac("order_1|pay_1", SECRET);
        service.verifyAndActivate(7L, "order_1", "pay_1", sig);
        LocalDateTime first = profile.getPremiumUntil();
        service.verifyAndActivate(7L, "order_1", "pay_1", sig);
        assertEquals(first, profile.getPremiumUntil());
    }

    @Test
    void signedWebhookActivatesPremium() {
        String body = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_9\",\"order_id\":\"order_1\"}}}}";
        service.handleWebhook(body, hmac(body, "hook_secret"));
        assertTrue(profile.hasActivePremium());
        assertEquals("pay_9", payment.getRazorpayPaymentId());
    }

    @Test
    void unsignedWebhookIsRejected() {
        assertThrows(AccessDeniedException.class, () -> service.handleWebhook("{}", "deadbeef"));
    }

    private static String hmac(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
