package com.stockflow.stockflowbackend.auth;

import java.util.regex.Pattern;

public class PasswordValidator {

    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[^A-Za-z0-9]");

    private PasswordValidator() {}

    public static void validate(String password) {
        if (password == null || password.length() < 8) {
            throw new RuntimeException("Password must be at least 8 characters");
        }
        if (!UPPERCASE.matcher(password).find()) {
            throw new RuntimeException("Password must include at least one capital letter");
        }
        if (!DIGIT.matcher(password).find()) {
            throw new RuntimeException("Password must include at least one number");
        }
        if (!SPECIAL.matcher(password).find()) {
            throw new RuntimeException("Password must include at least one special character (e.g. ? _ ! @ #)");
        }
    }
}
