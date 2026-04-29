package com.leappoc.app.controller;

import com.leappoc.shared.dto.UserInfoDto;
import com.leappoc.shared.security.MockUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Provides mock authentication endpoints so the app can be tested
 * without a live Entra ID tenant (e.g. after free-trial expiry).
 */
@RestController
@RequestMapping("/api/mock")
public class MockAuthController {

    private record MockUserDef(String displayName, String email,
                                List<String> groups,
                                String description) {}

    private static final LinkedHashMap<String, MockUserDef> MOCK_USERS = new LinkedHashMap<>();

    static {
        MOCK_USERS.put("deaa7af4-ef97-4ebe-8cf3-10bb52bcdc3b", new MockUserDef("POC Admin", "admin@leappoc.mock",
                List.of("GRP_ADMIN"), "Group: GRP_ADMIN"));
        MOCK_USERS.put("de62386a-6618-40b9-94c6-4d04260942bc", new MockUserDef("POC Writer", "write@leappoc.mock",
                List.of("GRP_WRITE"), "Group: GRP_WRITE"));
        MOCK_USERS.put("72991c97-a5f6-46be-b58b-8fa5ecfc3a94", new MockUserDef("POC Reader", "read@leappoc.mock",
                List.of("GRP_READ"), "Group: GRP_READ"));
    }

    record MockUserOption(String username, String displayName, String description) {}

    @GetMapping("/users")
    public ResponseEntity<List<MockUserOption>> getUsers() {
        List<MockUserOption> users = MOCK_USERS.entrySet().stream()
                .map(e -> new MockUserOption(e.getKey(), e.getValue().displayName(), e.getValue().description()))
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/login")
    public ResponseEntity<UserInfoDto> login(@RequestBody Map<String, String> body,
                                              HttpServletRequest request,
                                              HttpServletResponse response) {
        String username = body.get("username");
        if (username == null || !MOCK_USERS.containsKey(username)) {
            return ResponseEntity.badRequest().build();
        }

        MockUserDef def = MOCK_USERS.get(username);

        // Build authorities from groups
        Set<GrantedAuthority> authorities = new HashSet<>();
        for (String group : def.groups()) {
            authorities.add(new SimpleGrantedAuthority("GROUP_" + group));
        }

        // Create authentication with MockUserPrincipal
        MockUserPrincipal principal = new MockUserPrincipal(username, def.displayName(), def.email());
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);

        // Persist to SecurityContext + session
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authToken);
        SecurityContextHolder.setContext(context);
        new HttpSessionSecurityContextRepository().saveContext(context, request, response);

        // Build response DTO
        UserInfoDto dto = new UserInfoDto(def.displayName(), def.email(),
                List.of(), def.groups(), true);
        dto.setMock(true);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }
}
