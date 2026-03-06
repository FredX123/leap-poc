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
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;

import jakarta.servlet.http.HttpServletRequest;
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
                .authorizationEndpoint(authorization -> authorization
                    .authorizationRequestResolver(mfaAuthorizationRequestResolver())
                )
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
     * Custom authorization request resolver that forces MFA at Entra ID.
     * <p>
     * Security Defaults uses <b>risk-based</b> MFA — it does NOT enforce MFA on
     * every sign-in for custom applications. Azure Portal always triggers MFA
     * because Microsoft has built-in first-party policies for it.
     * <p>
     * To explicitly request MFA for our app, we add the OIDC {@code claims}
     * request parameter telling Entra that the {@code amr} claim with value
     * {@code "mfa"} is <b>essential</b>. This causes Entra to step up to MFA
     * even when its risk engine wouldn't otherwise require it.
     * <p>
     * Parameters added to the /authorize request:
     * <ul>
     *   <li>{@code prompt=login} — forces re-authentication (no SSO reuse)</li>
     *   <li>{@code claims={"id_token":{"amr":{"essential":true,"values":["mfa"]}}}}
     *       — tells Entra that MFA is required</li>
     * </ul>
     * <p>
     * <b>Note:</b> For production, a Conditional Access policy (Entra P1) targeting
     * this app with "Require MFA" grant control is the recommended approach.
     */
    private OAuth2AuthorizationRequestResolver mfaAuthorizationRequestResolver() {
        DefaultOAuth2AuthorizationRequestResolver defaultResolver =
                new DefaultOAuth2AuthorizationRequestResolver(
                        clientRegistrationRepository, "/oauth2/authorization");

        return new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                return addMfaParameters(defaultResolver.resolve(request));
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                return addMfaParameters(defaultResolver.resolve(request, clientRegistrationId));
            }
        };
    }

    /**
     * Adds MFA-enforcing parameters to the Entra /authorize request.
     */
    private OAuth2AuthorizationRequest addMfaParameters(OAuth2AuthorizationRequest request) {
        if (request == null) return null;

        Map<String, Object> additionalParams = new LinkedHashMap<>(request.getAdditionalParameters());

        // Force fresh authentication (no SSO session reuse)
        additionalParams.put("prompt", "login");

        // OIDC claims request: tell Entra that the "amr" claim must contain "mfa".
        // When marked as essential, Entra will step up to MFA to satisfy the request.
        additionalParams.put("claims",
                "{\"id_token\":{\"amr\":{\"essential\":true,\"values\":[\"mfa\"]}}}");

        return OAuth2AuthorizationRequest.from(request)
                .additionalParameters(additionalParams)
                .build();
    }

    /**
     * Configures a custom {@link OAuth2UserService} to process OpenID Connect (OIDC) user information
     * and map claims such as roles into Spring Security's granted authorities.
     * Also validates that MFA was performed by checking the {@code amr} claim.
     *
     * @return a customized {@link OAuth2UserService} for handling OIDC user processing
     */
    @Bean
    public OAuth2UserService<OidcUserRequest, OidcUser> oidcUserService() {
        OidcUserService delegate = new OidcUserService();

        return (OidcUserRequest userRequest) -> {
            OidcUser oidcUser = delegate.loadUser(userRequest);

            // --- Verify MFA was performed via the 'amr' (auth method reference) claim ---
            List<String> amr = oidcUser.getClaimAsStringList("amr");
            if (amr != null && amr.contains("mfa")) {
                log.info("MFA verified for user '{}'. amr claim: {}", oidcUser.getPreferredUsername(), amr);
            } else {
                log.warn("MFA NOT detected for user '{}'. amr claim: {}. "
                       + "Ensure Security Defaults is enabled in Entra ID.",
                         oidcUser.getPreferredUsername(), amr);
            }

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
