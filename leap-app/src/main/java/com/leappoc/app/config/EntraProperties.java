package com.leappoc.app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Microsoft Entra ID app-only (client credentials) access.
 *
 * <p>Set the following in application.yml or via environment variables:
 * <pre>
 *   app.entra.tenant-id   — your Entra ID (Azure AD) tenant ID
 *   app.entra.client-id   — the Application (client) ID of the Entra app registration
 *   app.entra.client-secret — a client secret created for that app registration
 * </pre>
 * The app registration must have the Microsoft Graph <b>Application</b> permission
 * {@code User.Read.All} with admin consent granted.
 */
@Configuration
@ConfigurationProperties(prefix = "app.entra")
public class EntraProperties {

    private String tenantId;
    private String clientId;
    private String clientSecret;

    public String getTenantId()                    { return tenantId; }
    public void   setTenantId(String tenantId)     { this.tenantId = tenantId; }

    public String getClientId()                    { return clientId; }
    public void   setClientId(String clientId)     { this.clientId = clientId; }

    public String getClientSecret()                    { return clientSecret; }
    public void   setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
}
