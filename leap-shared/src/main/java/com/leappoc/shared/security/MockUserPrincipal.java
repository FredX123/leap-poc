package com.leappoc.shared.security;

/**
 * Principal object for mock-authenticated users.
 * Used by MockAuthController to create a session without Entra ID.
 */
public class MockUserPrincipal {

    private final String userId;
    private final String displayName;
    private final String email;

    public MockUserPrincipal(String userId, String displayName, String email) {
        this.userId = userId;
        this.displayName = displayName;
        this.email = email;
    }

    public String getUserId() { return userId; }
    public String getDisplayName() { return displayName; }
    public String getEmail() { return email; }
}
