package com.leappoc.usermgmt.service;

import com.leappoc.shared.dto.UserInfoDto;
import jakarta.annotation.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    /**
     * Builds a {@link UserInfoDto} object based on the provided {@link OidcUser} principal.
     * If the principal is null, a default {@link UserInfoDto} is returned with null or empty values
     * and authentication set to false. If the principal is not null, the method extracts user details
     * including display name, email, roles, and group information.
     *
     * @param principal the {@link OidcUser} representing the authenticated user's details;
     *                  can be null
     * @return a {@link UserInfoDto} object containing the user's display name, email, roles, groups,
     *         and authentication status
     */
    public UserInfoDto buildUserInfo(@Nullable OidcUser principal) {
        if (principal == null) {
            return new UserInfoDto(null, null, List.of(), List.of(), false);
        }

        String displayName = principal.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = principal.getPreferredUsername();
        }

        String email = principal.getEmail();

        // Extract roles from user authorities
        List<String> roles = getRoles(principal);

        // Extract groups from authorities (GROUP_GRP_ADMIN -> GRP_ADMIN)
        List<String> groups = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("GROUP_"))
                .map(a -> a.substring(6)) // GROUP_GRP_ADMIN -> GRP_ADMIN
                .toList();

        return new UserInfoDto(displayName, email, roles, groups, true);
    }

    /**
     * Extracts roles associated with the given {@link OidcUser}. Roles are determined
     * either from user authorities or from a claim within the user's identity token,
     * with a preference for authorities. If no roles are mapped to authorities, the
     * method falls back to retrieving roles from the "roles" claim.
     *
     * @param principal the authenticated {@link OidcUser} whose roles need to be extracted
     * @return a list of role names as strings, either fetched from the user's authorities
     *         or as a fallback from the "roles" claim; never null
     */
    private static List<String> getRoles(OidcUser principal) {
        // Prefer authorities (once you map roles -> ROLE_APP_* in SecurityConfig)
        List<String> rolesFromAuthorities = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5)) // ROLE_APP_ADMIN -> APP_ADMIN
                .toList();

        // Fallback to claim if authorities haven't been mapped yet
        List<String> rolesFromClaim = principal.getClaimAsStringList("roles");
        if (rolesFromClaim == null) rolesFromClaim = List.of();

        // Choose one strategy:
        // - If mapped, authorities will contain roles and you can ignore claims.
        // - During POC/debugging, fallback helps.
        return !rolesFromAuthorities.isEmpty()
                ? rolesFromAuthorities
                : rolesFromClaim;
    }
}