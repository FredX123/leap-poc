package com.leappoc.shared.security;

/**
 * Central place for Entra App Role names.
 * The "ROLE_" prefix is added by Spring Security automatically.
 */
public final class RoleConstants {

    private RoleConstants() {}

    /** Entra role values (as they appear in the token 'roles' claim) */
    public static final String APP_ADMIN = "APP_ADMIN";
    public static final String APP_READ  = "APP_READ";
    public static final String APP_WRITE = "APP_WRITE";

    /** Spring Security authority names (ROLE_ prefix) */
    public static final String ROLE_APP_ADMIN = "ROLE_APP_ADMIN";
    public static final String ROLE_APP_READ  = "ROLE_APP_READ";
    public static final String ROLE_APP_WRITE = "ROLE_APP_WRITE";

    /** Entra group names (as they appear after mapping) */
    public static final String GRP_ADMIN = "GRP_ADMIN";
    public static final String GRP_READ  = "GRP_READ";
    public static final String GRP_WRITE = "GRP_WRITE";

    /** Spring Security authority names for groups (GROUP_ prefix) */
    public static final String GROUP_GRP_ADMIN = "GROUP_GRP_ADMIN";
    public static final String GROUP_GRP_READ  = "GROUP_GRP_READ";
    public static final String GROUP_GRP_WRITE = "GROUP_GRP_WRITE";
}
