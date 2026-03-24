package com.leappoc.comment.controller;

import com.leappoc.comment.service.CommentService;
import com.leappoc.shared.dto.*;
import com.leappoc.shared.security.RoleConstants;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '"
            + RoleConstants.APP_WRITE + "', '" + RoleConstants.APP_ADMIN + "')")
    public ResponseEntity<List<CommentThreadDto>> getThread(
            @RequestParam String entityType,
            @RequestParam Long entityId,
            @AuthenticationPrincipal OidcUser principal) {

        String currentUserId = extractUserId(principal);
        List<CommentThreadDto> thread = commentService.getThread(entityType, entityId, currentUserId);
        return ResponseEntity.ok(thread);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_WRITE + "', '" + RoleConstants.APP_ADMIN + "')")
    public ResponseEntity<CommentDto> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal OidcUser principal) {

        String userId = extractUserId(principal);
        String displayName = principal.getAttribute("name");
        String email = extractEmail(principal);

        CommentDto created = commentService.createComment(request, userId, displayName, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_WRITE + "', '" + RoleConstants.APP_ADMIN + "')")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal OidcUser principal) {

        String currentUserId = extractUserId(principal);
        CommentDto updated = commentService.updateComment(id, request.getContent(), currentUserId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_WRITE + "', '" + RoleConstants.APP_ADMIN + "')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal OidcUser principal) {

        String currentUserId = extractUserId(principal);
        boolean isAdmin = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(RoleConstants.ROLE_APP_ADMIN::equals);

        commentService.deleteComment(id, currentUserId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/counts")
    @PreAuthorize("hasAnyRole('" + RoleConstants.APP_READ + "', '"
            + RoleConstants.APP_WRITE + "', '" + RoleConstants.APP_ADMIN + "')")
    public ResponseEntity<Map<Long, Long>> getCounts(
            @RequestParam String entityType,
            @RequestParam List<Long> entityIds) {

        Map<Long, Long> counts = commentService.getCounts(entityType, entityIds);
        return ResponseEntity.ok(counts);
    }

    // --------------- private helpers ---------------

    private String extractUserId(OidcUser principal) {
        // Prefer Entra Object ID (oid); fall back to subject (sub)
        String oid = principal.getAttribute("oid");
        return oid != null ? oid : principal.getSubject();
    }

    private String extractEmail(OidcUser principal) {
        String email = principal.getAttribute("email");
        return email != null ? email : principal.getAttribute("preferred_username");
    }
}
