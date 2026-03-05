package com.leappoc.shared.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/**
 * DTO returned by GET /api/me.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserInfoDto {

    private String displayName;
    private String email;
    private List<String> roles;
    private boolean authenticated;

    public UserInfoDto() {}

    public UserInfoDto(String displayName, String email, List<String> roles, boolean authenticated) {
        this.displayName = displayName;
        this.email = email;
        this.roles = roles;
        this.authenticated = authenticated;
    }

    // --- Getters & Setters ---

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public boolean isAuthenticated() { return authenticated; }
    public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }
}
