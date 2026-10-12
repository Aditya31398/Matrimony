package com.soulsync.exception;

/** Thrown when a free member uses a premium-only feature; mapped to HTTP 402. */
public class PremiumRequiredException extends RuntimeException {
    public PremiumRequiredException(String message) {
        super(message);
    }
}
