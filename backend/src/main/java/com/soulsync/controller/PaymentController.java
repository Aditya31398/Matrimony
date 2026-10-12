package com.soulsync.controller;

import com.soulsync.model.PremiumPlan;
import com.soulsync.model.Profile;
import com.soulsync.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/plans")
    public ResponseEntity<Map<String, Object>> plans() {
        List<Map<String, Object>> plans = Arrays.stream(PremiumPlan.values())
                .map(p -> Map.<String, Object>of(
                        "id", p.name(),
                        "label", p.getLabel(),
                        "months", p.getMonths(),
                        "amount", p.getAmountPaise() / 100,
                        "perMonth", Math.round(p.getAmountPaise() / 100.0 / p.getMonths())))
                .toList();
        return ResponseEntity.ok(Map.of("configured", paymentService.isConfigured(), "plans", plans));
    }

    @PostMapping("/order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        PremiumPlan plan = PremiumPlan.fromId(body.get("planId"))
                .orElseThrow(() -> new IllegalArgumentException("Unknown plan"));
        if (!paymentService.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "Payments are not set up yet. Please try again later."));
        }
        var order = paymentService.createOrder(currentProfileId(request), plan);

        Map<String, Object> resp = new HashMap<>();
        resp.put("orderId", order.orderId());
        resp.put("amount", order.amountPaise());
        resp.put("currency", "INR");
        resp.put("keyId", order.keyId());
        resp.put("planLabel", plan.getLabel());
        resp.put("name", order.name());
        resp.put("email", order.email());
        if (order.phone() != null) resp.put("phone", order.phone());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Profile profile = paymentService.verifyAndActivate(
                currentProfileId(request),
                body.get("orderId"),
                body.get("paymentId"),
                body.get("signature"));
        return ResponseEntity.ok(Map.of(
                "message", "Premium activated",
                "premiumUntil", profile.getPremiumUntil().toString()));
    }

    /** Configure in Razorpay Dashboard → Webhooks with events payment.captured and order.paid. */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(
            @RequestBody String body,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.handleWebhook(body, signature);
        return ResponseEntity.ok().build();
    }

    private Long currentProfileId(HttpServletRequest request) {
        Long profileId = (Long) request.getAttribute("profileId");
        if (profileId == null) throw new IllegalStateException("No authenticated profile in request");
        return profileId;
    }
}
