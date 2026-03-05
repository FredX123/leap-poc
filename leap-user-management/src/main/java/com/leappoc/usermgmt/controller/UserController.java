package com.leappoc.usermgmt.controller;

import com.leappoc.shared.dto.UserInfoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Returns the currently authenticated user's info and roles.
 * If the user is anonymous, returns authenticated=false with no roles.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> me(@AuthenticationPrincipal OidcUser principal) {
        if (principal == null) {
            // Anonymous / not logged in
            return ResponseEntity.ok(
                new UserInfoDto(null, null, Collections.emptyList(), false)
            );
        }

        String displayName = principal.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = principal.getPreferredUsername();
        }
        String email = principal.getEmail();

        // Collect ROLE_APP_* authorities (strip the ROLE_ prefix for the frontend)
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_APP_"))
                .map(a -> a.substring(5))   // ROLE_APP_ADMIN → APP_ADMIN
                .collect(Collectors.toList());

        return ResponseEntity.ok(new UserInfoDto(displayName, email, roles, true));
    }
}
