package com.stockflow.stockflowbackend.email;

import java.security.SecureRandom;

public final class PickupCodeUtil {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
    private static final SecureRandom RANDOM = new SecureRandom();

    private PickupCodeUtil() {}

    public static String generate() {
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
