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

        MOCK_USERS.put("03121c56-fa81-49ea-92b6-be35a180af03", new MockUserDef("Approver1 Audit",
                "approver1-audit@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_INTERNAL_AUDIT"), "Approver1 : Group: GRP_INTERNAL_AUDIT"));
        MOCK_USERS.put("22903ef3-b781-4cbb-9f10-9d4f93e0cc24", new MockUserDef("Approver2 Audit",
                "approver2-audit@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_INTERNAL_AUDIT"), "Approver2 : Group: GRP_INTERNAL_AUDIT"));
        MOCK_USERS.put("8e893a78-3d31-492e-8c7a-5be3ea697197", new MockUserDef("Approver3 Audit",
                "approver3-audit@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_INTERNAL_AUDIT"), "Approver3 : Group: GRP_INTERNAL_AUDIT"));

        MOCK_USERS.put("a9b97dc5-11ea-4015-ae36-278855a84ac1", new MockUserDef("Approver1 Financial",
                "approver1-fin@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_FINANCIAL_CONTROL"), "Approver1 : Group: GRP_FINANCIAL_CONTROL"));
        MOCK_USERS.put("2d09f7d2-6db0-439b-94e0-3f5e966e30ca", new MockUserDef("Approver2 Financial",
                "approver2-fin@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_FINANCIAL_CONTROL"), "Approver2 : Group: GRP_FINANCIAL_CONTROL"));
        MOCK_USERS.put("7b82ceff-c361-48e7-913c-966a8c9cdf6d", new MockUserDef("Approver3 Financial",
                "approver3-fin@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_FINANCIAL_CONTROL"), "Approver3 : Group: GRP_FINANCIAL_CONTROL"));


        MOCK_USERS.put("5784db65-e247-45fd-bcb5-aa291469a572", new MockUserDef("Approver1 Regulatory",
                "approver1-reqularoty@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REGULATORY_REPORTING"), "Approver1 : Group: GRP_REGULATORY_REPORTING"));
        MOCK_USERS.put("a5f00a02-b3d1-4eb1-b893-9e4d7063fa61", new MockUserDef("Approver2 Regulatory",
                "approver2-reqularoty@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REGULATORY_REPORTING"), "Approver2 : Group: GRP_REGULATORY_REPORTING"));
        MOCK_USERS.put("1595ef2e-3c8f-4f82-a221-f885d226939a", new MockUserDef("Approver3 Regulatory",
                "approver3-reqularoty@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REGULATORY_REPORTING"), "Approver3 : Group: GRP_REGULATORY_REPORTING"));

        MOCK_USERS.put("24e3a8ff-ddb0-434a-affc-cb45f1a5304b", new MockUserDef("Approver1 Risk",
                "approver1-risk@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_LIQUIDITY_RISK"), "Approver1 : Group: GRP_LIQUIDITY_RISK"));
        MOCK_USERS.put("0c4655e0-7dff-4143-98b3-3bbeac0705af", new MockUserDef("Approver1 Risk",
                "approver2-risk@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_LIQUIDITY_RISK"), "Approver2 : Group: GRP_LIQUIDITY_RISK"));
        MOCK_USERS.put("a288ccaf-ea23-45d6-a36b-8d302778b236", new MockUserDef("Approver3 Risk",
                "approver3-risk@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_LIQUIDITY_RISK"), "Approver3 : Group: GRP_LIQUIDITY_RISK"));

        MOCK_USERS.put("df8c6373-0285-452e-a232-7f366df72c77", new MockUserDef("Approver1 Treasury",
                "approver1-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY"), "Approver1 : Group: GRP_TREASURY"));
        MOCK_USERS.put("a0c28ea5-73fd-4ba2-b924-90e78bd591d8", new MockUserDef("Approver2 Treasury",
                "approver2-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY"), "Approver2 : Group: GRP_TREASURY"));
        MOCK_USERS.put("1fa61dc7-967e-4b8f-9a83-d16228c9b408", new MockUserDef("Approver3 Treasury",
                "approver3-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY"), "Approver3 : Group: GRP_TREASURY"));

        MOCK_USERS.put("ec3dfda9-c1aa-4341-9cc1-54d8c1796de2", new MockUserDef("Maker1 Reporting",
                "maker1-reporting@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REPORTING_ANALYST"), "Maker1 : Group: GRP_REPORTING_ANALYST"));
        MOCK_USERS.put("3c4d2d67-2034-4f58-ac76-ba7bf40f76c3", new MockUserDef("Maker2 Reporting",
                "maker2-reporting@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REPORTING_ANALYST"), "Maker2 : Group: GRP_REPORTING_ANALYST"));
        MOCK_USERS.put("a98efc1c-8784-4ea5-929c-9b778f431658", new MockUserDef("Maker3 Reporting",
                "maker3-reporting@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_REPORTING_ANALYST"), "Maker3 : Group: GRP_REPORTING_ANALYST"));

        MOCK_USERS.put("3dfa4871-be45-4358-92b5-5e09a7f86035", new MockUserDef("Maker1 Treasury",
                "maker1-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY_ANALYST"), "Maker1 : Group: GRP_TREASURY_ANALYST"));
        MOCK_USERS.put("64e671f0-b250-4989-92f0-1e379e400a9c", new MockUserDef("Maker2 Treasury",
                "maker2-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY_ANALYST"), "Maker2 : Group: GRP_TREASURY_ANALYST"));
        MOCK_USERS.put("97e55d55-d1f8-4cd8-9659-3da2e56c8e7d", new MockUserDef("Maker3 Treasury",
                "maker3-treasury@danielxtbsmgmail.onmicrosoft.com",
                List.of("GRP_TREASURY_ANALYST"), "Maker3 : Group: GRP_TREASURY_ANALYST"));
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
