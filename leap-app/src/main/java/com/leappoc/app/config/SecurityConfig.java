package com.leappoc.app.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.oauth2.core.user.OAuth2UserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Central security configuration for the BFF.
 * <p>
 * - oauth2Login authenticates via Entra ID (OIDC).
 * - Session cookie is the sole credential stored in the browser.
 * - CSRF uses a cookie so Angular can read it (XSRF-TOKEN).
 * - Entra "roles" claim is mapped to Spring GrantedAuthorities (ROLE_APP_*).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity          // enables @PreAuthorize / @Secured on methods
public class SecurityConfig {

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // CSRF: cookie-based so Angular can read XSRF-TOKEN and send X-XSRF-TOKEN header
        CookieCsrfTokenRepository csrfRepo = CookieCsrfTokenRepository.withHttpOnlyFalse();
        CsrfTokenRequestAttributeHandler csrfHandler = new CsrfTokenRequestAttributeHandler();
        // Setting this to empty string makes Spring Security use the default attribute name
        // but NOT defer loading of the token (needed so the cookie is always set).
        csrfHandler.setCsrfRequestAttributeName(null);

        http
            // --- CSRF ---
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfRepo)
                .csrfTokenRequestHandler(csrfHandler)
            )

            // --- Authorization rules ---
            .authorizeHttpRequests(auth -> auth
                // Public: SPA assets, login trigger, and the /api/me endpoint (returns anon if not logged in)
                .requestMatchers("/", "/index.html", "/assets/**", "/*.js", "/*.css", "/*.ico").permitAll()
                .requestMatchers("/api/me").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )

            // --- OAuth 2.0 Login (OIDC) ---
            .oauth2Login(oauth -> oauth
                // After successful login, redirect to the Angular frontend
                .defaultSuccessUrl(frontendUrl + "/", true)
            )

            // --- Logout ---
            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(this::logoutSuccessHandler)
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
            )

            // --- For AJAX calls: return 401 instead of redirect to login page ---
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    request -> request.getRequestURI().startsWith("/api/")
                )
            );

        return http.build();
    }

    /**
     * Maps Entra "roles" claim to Spring ROLE_* authorities.
     */
    @Bean
    public GrantedAuthoritiesMapper grantedAuthoritiesMapper() {
        return authorities -> {
            Set<GrantedAuthority> mapped = new HashSet<>();
            for (GrantedAuthority authority : authorities) {
                mapped.add(authority);                           // keep original authority

                Map<String, Object> attributes = Collections.emptyMap();
                if (authority instanceof OidcUserAuthority oidc) {
                    attributes = oidc.getIdToken().getClaims();
                } else if (authority instanceof OAuth2UserAuthority oauth) {
                    attributes = oauth.getAttributes();
                }

                // Entra puts roles in the "roles" claim (a JSON array of strings)
                Object rolesObj = attributes.get("roles");
                if (rolesObj instanceof Collection<?> roles) {
                    for (Object role : roles) {
                        mapped.add(new SimpleGrantedAuthority("ROLE_" + role.toString()));
                    }
                }
            }
            return mapped;
        };
    }

    // --------------- helpers ---------------

    private void logoutSuccessHandler(HttpServletRequest request,
                                      HttpServletResponse response,
                                      Authentication authentication) throws IOException {
        response.sendRedirect(frontendUrl + "/");
    }
}
