package com.leappoc.app.service;

import com.leappoc.shared.dto.EntraUserDto;
import com.leappoc.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

/**
 * Looks up user profiles from Microsoft Entra ID via the Microsoft Graph API.
 *
 * <p>Uses app-only authentication (client credentials flow) — the token is obtained
 * from {@link GraphTokenService} rather than from the logged-in user's session.
 */
@Service
public class EntraUserLookupService {

    private static final Logger log = LoggerFactory.getLogger(EntraUserLookupService.class);

    private static final String GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
    private static final String USER_SELECT = "id,givenName,surname,displayName,userPrincipalName,mail";

    private final GraphTokenService tokenService;
    private final WebClient webClient;

    @Autowired
    public EntraUserLookupService(GraphTokenService tokenService) {
        this(tokenService, GRAPH_BASE_URL);
    }

    /** Package-private constructor that accepts a custom base URL (used by tests). */
    EntraUserLookupService(GraphTokenService tokenService, String baseUrl) {
        this.tokenService = tokenService;
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    /**
     * Fetch a user from Entra ID by object ID (or UPN / email, since Graph accepts those too).
     *
     * @param userId  the Entra object ID, UPN, or email address
     * @return an {@link EntraUserDto} with the user's profile basics
     * @throws ResourceNotFoundException if Graph returns 404
     * @throws RuntimeException          if token acquisition or the Graph call fails
     */
    public EntraUserDto lookupUser(String userId) {
        log.debug("Looking up Entra user: {}", userId);

        String accessToken = tokenService.getAccessToken();

        @SuppressWarnings("unchecked")
        Map<String, Object> body = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/users/{id}")
                        .queryParam("$select", USER_SELECT)
                        .build(userId))
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .onStatus(status -> status.value() == 404, resp ->
                        Mono.error(new ResourceNotFoundException("Entra user", userId)))
                .onStatus(HttpStatusCode::isError, resp ->
                        resp.bodyToMono(String.class)
                                .defaultIfEmpty("(no body)")
                                .flatMap(errBody -> {
                                    log.error("Graph API error {}: {}", resp.statusCode().value(), errBody);
                                    return Mono.error(new RuntimeException(
                                            "Graph API error " + resp.statusCode().value()));
                                }))
                .bodyToMono(Map.class)
                .block();

        if (body == null) {
            throw new RuntimeException("Graph API returned empty response for user " + userId);
        }

        EntraUserDto dto = new EntraUserDto(
                str(body.get("id")),
                str(body.get("givenName")),
                str(body.get("surname")),
                str(body.get("displayName")),
                str(body.get("userPrincipalName")),
                str(body.get("mail"))
        );

        log.debug("Resolved Entra user: {} ({})", dto.getDisplayName(), dto.getUserPrincipalName());
        return dto;
    }

    private static String str(Object value) {
        return value == null ? null : value.toString();
    }
}
