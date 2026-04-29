package com.leappoc.usermgmt.service;

import com.leappoc.shared.dto.UserInfoDto;
import com.leappoc.shared.security.MockUserPrincipal;
import jakarta.annotation.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;

@Service
public class UserService {

    /**
     * Builds a {@link UserInfoDto} from the current {@link Authentication}.
     * Supports both OIDC (Entra ID) and mock authentication principals.
     */
    public UserInfoDto buildUserInfo(@Nullable Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return new UserInfoDto(null, null, List.of(), List.of(), false);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            return buildOidcUserInfo(oidcUser);
        }

        if (principal instanceof MockUserPrincipal mock) {
            return buildMockUserInfo(mock, authentication.getAuthorities());
        }

        return new UserInfoDto(null, null, List.of(), List.of(), false);
    }

    private UserInfoDto buildOidcUserInfo(OidcUser principal) {
        String displayName = principal.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = principal.getPreferredUsername();
        }

        String email = principal.getEmail();

        List<String> groups = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("GROUP_"))
                .map(a -> a.substring(6))
                .toList();

        return new UserInfoDto(displayName, email, List.of(), groups, true);
    }

    private UserInfoDto buildMockUserInfo(MockUserPrincipal mock,
                                           Collection<? extends GrantedAuthority> authorities) {
        List<String> groups = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("GROUP_"))
                .map(a -> a.substring(6))
                .toList();

        UserInfoDto dto = new UserInfoDto(mock.getDisplayName(), mock.getEmail(), List.of(), groups, true);
        dto.setMock(true);
        return dto;
    }
}