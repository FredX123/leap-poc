package com.leappoc.usermgmt.controller;

import com.leappoc.shared.dto.UserInfoDto;
import com.leappoc.usermgmt.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

/**
 * Returns the currently authenticated user's info and roles.
 * If the user is anonymous, returns authenticated=false with no roles.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final boolean mockProfile;

    public UserController(UserService userService, Environment env) {
        this.userService = userService;
        this.mockProfile = Arrays.asList(env.getActiveProfiles()).contains("mock");
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> me(Authentication authentication) {
        UserInfoDto dto = userService.buildUserInfo(authentication);
        dto.setMockProfile(mockProfile);
        log.debug("Returning roles to frontend: {}", dto.getRoles());
        return ResponseEntity.ok(dto);
    }
}
