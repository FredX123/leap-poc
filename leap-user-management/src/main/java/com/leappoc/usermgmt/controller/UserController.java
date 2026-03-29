package com.leappoc.usermgmt.controller;

import com.leappoc.shared.dto.UserInfoDto;
import com.leappoc.usermgmt.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Returns the currently authenticated user's info and roles.
 * If the user is anonymous, returns authenticated=false with no roles.
 */
@RestController
@RequestMapping("/api")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> me(Authentication authentication) {
        UserInfoDto dto = userService.buildUserInfo(authentication);
        log.debug("Returning roles to frontend: {}", dto.getRoles());
        return ResponseEntity.ok(dto);
    }
}
