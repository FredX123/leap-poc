package com.leappoc.app.controller;

import com.leappoc.app.service.EntraUserLookupService;
import com.leappoc.shared.dto.EntraUserDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoint for looking up Microsoft Entra ID user profiles.
 *
 * <p>Accessible to any authenticated user. The backend calls Graph with its own
 * application identity (client credentials), not the logged-in user's token.
 */
@RestController
@RequestMapping("/api/entra-users")
public class EntraUserController {

    private final EntraUserLookupService lookupService;

    public EntraUserController(EntraUserLookupService lookupService) {
        this.lookupService = lookupService;
    }

    /**
     * Look up a single Entra ID user by object ID, UPN, or email.
     *
     * @param userId  the user identifier (object ID, UPN, or mail)
     * @return the user's basic profile
     */
    @GetMapping("/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<EntraUserDto> getUser(@PathVariable String userId) {
        return ResponseEntity.ok(lookupService.lookupUser(userId));
    }
}
