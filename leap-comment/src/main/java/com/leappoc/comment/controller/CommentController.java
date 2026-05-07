package com.leappoc.comment.controller;

import com.leappoc.comment.service.CommentService;
import com.leappoc.shared.dto.*;
import com.leappoc.shared.security.MockUserPrincipal;
import com.leappoc.shared.security.RoleConstants;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
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
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '"
            + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<List<CommentThreadDto>> getThread(
            @RequestParam String reportType,
            @RequestParam String lineKey,
            @RequestParam(required = false) String segmentName,
            Authentication authentication) {

        String currentUserId = extractUserId(authentication);
        List<CommentThreadDto> thread = commentService.getThread(reportType, lineKey, segmentName, currentUserId);
        return ResponseEntity.ok(thread);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<CommentDto> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        String userId = extractUserId(authentication);
        String displayName = extractDisplayName(authentication);
        String email = extractEmail(authentication);

        CommentDto created = commentService.createComment(request, userId, displayName, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request,
            Authentication authentication) {

        String currentUserId = extractUserId(authentication);
        CommentDto updated = commentService.updateComment(id, request.getContent(), request.getDriverCode(), currentUserId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication) {

        String currentUserId = extractUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> RoleConstants.GROUP_GRP_ADMIN.equals(a));

        commentService.deleteComment(id, currentUserId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/counts")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '"
            + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<Map<String, Long>> getCounts(
            @RequestParam String reportType,
            @RequestParam(required = false) String segmentName) {

        Map<String, Long> counts = commentService.getCounts(reportType, segmentName);
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/hierarchy")
    @PreAuthorize("hasAnyAuthority('" + RoleConstants.GROUP_GRP_READ + "', '"
            + RoleConstants.GROUP_GRP_WRITE + "', '" + RoleConstants.GROUP_GRP_ADMIN + "')")
    public ResponseEntity<Map<String, List<CommentThreadDto>>> getHierarchyThreads(
            @RequestParam String reportType,
            @RequestParam String segmentName,
            @RequestParam String lineKey,
            Authentication authentication) {

        String currentUserId = extractUserId(authentication);
        Map<String, List<CommentThreadDto>> result = commentService.getHierarchyThreads(
                reportType, segmentName, lineKey, currentUserId);
        return ResponseEntity.ok(result);
    }

    // --------------- private helpers ---------------

    private String extractUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof OidcUser oidc) {
            String oid = oidc.getAttribute("oid");
            return oid != null ? oid : oidc.getSubject();
        }
        if (principal instanceof MockUserPrincipal mock) {
            return mock.getUserId();
        }
        throw new IllegalStateException("Unknown principal type: " + principal.getClass());
    }

    private String extractDisplayName(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof OidcUser oidc) {
            return oidc.getAttribute("name");
        }
        if (principal instanceof MockUserPrincipal mock) {
            return mock.getDisplayName();
        }
        return "Unknown";
    }

    private String extractEmail(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof OidcUser oidc) {
            String email = oidc.getAttribute("email");
            return email != null ? email : oidc.getAttribute("preferred_username");
        }
        if (principal instanceof MockUserPrincipal mock) {
            return mock.getEmail();
        }
        return null;
    }
}
