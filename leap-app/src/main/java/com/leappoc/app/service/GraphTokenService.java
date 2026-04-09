package com.leappoc.app.service;

import com.azure.core.credential.AccessToken;
import com.azure.core.credential.TokenRequestContext;
import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import com.leappoc.app.config.EntraProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Acquires an app-only access token for Microsoft Graph using the client credentials flow.
 *
 * <p>Uses {@link ClientSecretCredential} from the Azure Identity SDK.
 * The token is scoped to {@code https://graph.microsoft.com/.default}.
 */
@Service
public class GraphTokenService {

    private static final Logger log = LoggerFactory.getLogger(GraphTokenService.class);
    private static final String GRAPH_SCOPE = "https://graph.microsoft.com/.default";

    private final ClientSecretCredential credential;

    public GraphTokenService(EntraProperties props) {
        log.info("Initialising GraphTokenService for tenant={}, clientId={}", props.getTenantId(), props.getClientId());
        this.credential = new ClientSecretCredentialBuilder()
                .tenantId(props.getTenantId())
                .clientId(props.getClientId())
                .clientSecret(props.getClientSecret())
                .build();
    }

    /**
     * Obtains a bearer token for the Microsoft Graph API.
     *
     * @return a non-null access token string
     * @throws RuntimeException if token acquisition fails
     */
    public String getAccessToken() {
        log.debug("Requesting Graph access token via client credentials");
        TokenRequestContext ctx = new TokenRequestContext().addScopes(GRAPH_SCOPE);
        AccessToken token = credential.getToken(ctx).block();
        if (token == null) {
            throw new RuntimeException("Token acquisition returned null");
        }
        log.debug("Graph access token acquired, expires at {}", token.getExpiresAt());
        return token.getToken();
    }
}
