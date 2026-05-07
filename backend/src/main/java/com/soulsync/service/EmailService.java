package com.soulsync.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final RestTemplate restTemplate;

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.from-name}")
    private String fromName;

    @Async
    public void sendOtpEmail(String toEmail, String firstName, String otp) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);

        Map<String, Object> body = Map.of(
            "sender",      Map.of("name", fromName, "email", fromAddress),
            "to",          List.of(Map.of("email", toEmail, "name", firstName)),
            "subject",     "Your SoulSync verification code: " + otp,
            "htmlContent", buildOtpHtml(firstName, otp)
        );

        try {
            restTemplate.postForObject(
                "https://api.brevo.com/v3/smtp/email",
                new HttpEntity<>(body, headers),
                String.class
            );
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpHtml(String firstName, String otp) {
        StringBuilder digits = new StringBuilder();
        for (char c : otp.toCharArray()) {
            digits.append(
                "<span style=\"display:inline-block;width:48px;height:56px;line-height:56px;text-align:center;" +
                "background:#fff7f5;border:2px solid #ffd5cc;border-radius:12px;font-size:28px;font-weight:900;" +
                "color:#ae3115;margin:0 4px;\">").append(c).append("</span>");
        }
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f8f4f0;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8f4f0;padding:40px 0;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#ae3115,#ff6b4a);padding:36px 48px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">SoulSync</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Your journey to love starts here</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:48px;text-align:center;">
                        <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:800;">Hi %s! 👋</h2>
                        <p style="margin:0 0 32px;color:#666;font-size:15px;line-height:1.6;">
                          Use the code below to verify your email address.<br>It expires in <strong>10 minutes</strong>.
                        </p>
                        <div style="margin:0 auto 32px;letter-spacing:4px;">%s</div>
                        <p style="margin:0;color:#999;font-size:12px;">
                          If you didn't create a SoulSync account, ignore this email.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8f4f0;padding:20px 48px;text-align:center;">
                        <p style="margin:0;color:#bbb;font-size:11px;">© 2025 SoulSync · All rights reserved</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(firstName, digits.toString());
    }
}
