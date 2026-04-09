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
                                List<String> roles, List<String> groups,
                                String description) {}

    private static final LinkedHashMap<String, MockUserDef> MOCK_USERS = new LinkedHashMap<>();

    static {
        MOCK_USERS.put("2ce33691-a662-434b-8676-55a3fc6799ef", new MockUserDef("POC Admin 1", "admin1@leappoc.mock",
                List.of("APP_ADMIN"), List.of(), "Role: APP_ADMIN"));
        MOCK_USERS.put("deaa7af4-ef97-4ebe-8cf3-10bb52bcdc3b", new MockUserDef("POC Admin 2", "admin2@leappoc.mock",
                List.of(), List.of("GRP_ADMIN"), "Group: GRP_ADMIN"));
        MOCK_USERS.put("2f2c9530-a002-4b59-8776-7ee1cd56e5a5", new MockUserDef("POC Writer 1", "write1@leappoc.mock",
                List.of("APP_WRITE"), List.of(), "Role: APP_WRITE"));
        MOCK_USERS.put("de62386a-6618-40b9-94c6-4d04260942bc", new MockUserDef("POC Writer 2", "write2@leappoc.mock",
                List.of(), List.of("GRP_WRITE"), "Group: GRP_WRITE"));
        MOCK_USERS.put("122386cf-65df-445e-99cf-b79501cf7ddb", new MockUserDef("POC Reader 1", "read1@leappoc.mock",
                List.of("APP_READ"), List.of(), "Role: APP_READ"));
        MOCK_USERS.put("72991c97-a5f6-46be-b58b-8fa5ecfc3a94", new MockUserDef("POC Reader 2", "read2@leappoc.mock",
                List.of(), List.of("GRP_READ"), "Group: GRP_READ"));
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

        // Build authorities
        Set<GrantedAuthority> authorities = new HashSet<>();
        for (String role : def.roles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }
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
                def.roles(), def.groups(), true);
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
