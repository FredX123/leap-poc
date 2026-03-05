package com.leappoc.app.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import java.util.*;

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

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @org.springframework.beans.factory.annotation.Value("${app.frontend-url:http://localhost:4200}")
    private String frontendUrl;

    private final ClientRegistrationRepository clientRegistrationRepository;

    public SecurityConfig(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

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
                .defaultSuccessUrl(frontendUrl + "/", true)
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(oidcUserService())   // custom service maps roles
                )
            )

            // --- Logout: redirect to Entra end_session_endpoint for federated logout ---
            .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(oidcLogoutSuccessHandler())
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
     * Configures a custom {@link OAuth2UserService} to process OpenID Connect (OIDC) user information
     * and map claims such as roles into Spring Security's granted authorities.
     * The method establishes a default OIDC delegate and processes roles from the "roles" claim,
     * mapping them into authorities prefixed with "ROLE_". Additionally, it creates a new
     * {@link DefaultOidcUser} instance with these mapped authorities alongside the original token
     * and user info.
     *
     * @return a customized {@link OAuth2UserService} for handling OIDC user processing
     */
    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService delegate = new OidcUserService();

        return (OidcUserRequest userRequest) -> {
            OidcUser oidcUser = delegate.loadUser(userRequest);

            // Read Entra app roles from claim "roles"
            List<String> roles = oidcUser.getClaimAsStringList("roles");
            if (roles == null) roles = List.of();

            Set<GrantedAuthority> mappedAuthorities = new HashSet<>(oidcUser.getAuthorities());

            // Convert APP_ADMIN -> ROLE_APP_ADMIN
            for (String role : roles) {
                mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role));
            }

            // Return a new OidcUser with the mapped authorities
            return new DefaultOidcUser(mappedAuthorities,
                    oidcUser.getIdToken(), oidcUser.getUserInfo(), "preferred_username");
        };
    }

    /**
     * OIDC-aware logout: redirects to Entra's end_session_endpoint so the
     * Microsoft SSO session is terminated (not just the local Spring session).
     * After Entra logout, it redirects back to the Angular frontend.
     */
    private LogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedLogoutSuccessHandler handler =
                new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri(frontendUrl + "/");
        return handler;
    }
}
