package com.leappoc.app.service;

import com.leappoc.shared.dto.EntraUserDto;
import com.leappoc.shared.exception.ResourceNotFoundException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link EntraUserLookupService}.
 *
 * <p>Uses OkHttp MockWebServer to simulate Graph API responses and Mockito for the
 * token service, so no real network calls are made.
 */
class EntraUserLookupServiceTest {

    private MockWebServer graphServer;
    private GraphTokenService tokenService;
    private EntraUserLookupService lookupService;

    @BeforeEach
    void setUp() throws Exception {
        graphServer = new MockWebServer();
        graphServer.start();

        tokenService = mock(GraphTokenService.class);
        when(tokenService.getAccessToken()).thenReturn("fake-token");

        lookupService = new EntraUserLookupService(tokenService, graphServer.url("/").toString());
    }

    @AfterEach
    void tearDown() throws Exception {
        graphServer.shutdown();
    }

    // --- Successful lookup ------------------------------------------------

    @Test
    void lookupUser_success() throws Exception {
        String json = """
                {
                    "id": "abc-123",
                    "givenName": "Jane",
                    "surname": "Doe",
                    "displayName": "Jane Doe",
                    "userPrincipalName": "jane.doe@contoso.com",
                    "mail": "jane.doe@contoso.com"
                }
                """;
        graphServer.enqueue(new MockResponse()
                .setResponseCode(200)
                .setHeader("Content-Type", "application/json")
                .setBody(json));

        EntraUserDto result = lookupService.lookupUser("abc-123");

        assertEquals("abc-123", result.getId());
        assertEquals("Jane", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        assertEquals("Jane Doe", result.getDisplayName());
        assertEquals("jane.doe@contoso.com", result.getUserPrincipalName());
        assertEquals("jane.doe@contoso.com", result.getMail());

        RecordedRequest request = graphServer.takeRequest();
        assertEquals("Bearer fake-token", request.getHeader("Authorization"));
        assertTrue(request.getPath().contains("/users/abc-123"));
        assertTrue(request.getPath().contains("$select="));
    }

    // --- Graph 404 --------------------------------------------------------

    @Test
    void lookupUser_notFound_throwsResourceNotFoundException() {
        graphServer.enqueue(new MockResponse()
                .setResponseCode(404)
                .setHeader("Content-Type", "application/json")
                .setBody("{\"error\":{\"code\":\"Request_ResourceNotFound\"}}"));

        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> lookupService.lookupUser("no-such-user"));

        assertTrue(ex.getMessage().contains("no-such-user"));
    }

    // --- Token acquisition failure ----------------------------------------

    @Test
    void lookupUser_tokenFailure_propagatesException() {
        when(tokenService.getAccessToken()).thenThrow(new RuntimeException("Credential error"));

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> lookupService.lookupUser("abc-123"));

        assertTrue(ex.getMessage().contains("Credential error"));
    }
}
