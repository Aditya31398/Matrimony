package com.soulsync.model;

import java.util.Arrays;
import java.util.Optional;

/** Premium plans sold through Razorpay; amounts are in paise. */
public enum PremiumPlan {
    MONTH_1("1 Month", 1, 49_900),
    MONTH_3("3 Months", 3, 129_900),
    MONTH_6("6 Months", 6, 199_900);

    private final String label;
    private final int months;
    private final int amountPaise;

    PremiumPlan(String label, int months, int amountPaise) {
        this.label = label;
        this.months = months;
        this.amountPaise = amountPaise;
    }

    public String getLabel() { return label; }
    public int getMonths() { return months; }
    public int getAmountPaise() { return amountPaise; }

    public static Optional<PremiumPlan> fromId(String id) {
        return Arrays.stream(values()).filter(p -> p.name().equalsIgnoreCase(id)).findFirst();
    }
}
