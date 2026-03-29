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
    private List<String> groups;
    private boolean authenticated;
    private boolean mock;

    public UserInfoDto() {}

    public UserInfoDto(String displayName, String email, List<String> roles, List<String> groups, boolean authenticated) {
        this.displayName = displayName;
        this.email = email;
        this.roles = roles;
        this.groups = groups;
        this.authenticated = authenticated;
    }

    // --- Getters & Setters ---

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }

    public List<String> getGroups() { return groups; }
    public void setGroups(List<String> groups) { this.groups = groups; }

    public boolean isAuthenticated() { return authenticated; }
    public void setAuthenticated(boolean authenticated) { this.authenticated = authenticated; }

    public boolean isMock() { return mock; }
    public void setMock(boolean mock) { this.mock = mock; }
}
