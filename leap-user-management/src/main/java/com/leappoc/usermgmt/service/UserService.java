package com.leappoc.usermgmt.service;

import com.leappoc.shared.dto.UserInfoDto;
import jakarta.annotation.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    public UserInfoDto buildUserInfo(@Nullable OidcUser principal) {
        if (principal == null) {
            return new UserInfoDto(null, null, List.of(), false);
        }

        String displayName = principal.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = principal.getPreferredUsername();
        }

        String email = principal.getEmail();

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
        List<String> roles = !rolesFromAuthorities.isEmpty()
                ? rolesFromAuthorities
                : rolesFromClaim;

        return new UserInfoDto(displayName, email, roles, true);
    }
}