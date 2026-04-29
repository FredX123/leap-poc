package com.leappoc.shared.security;

/**
 * Central place for Entra group-based authorization constants.
 * Authorization is controlled exclusively via Entra security groups.
 * Group Object IDs are mapped to these logical names in EntraGroupConfig.
 */
public final class RoleConstants {

    private RoleConstants() {}

    /** Entra group names (as they appear after mapping from Object IDs) */
    public static final String GRP_ADMIN = "GRP_ADMIN";
    public static final String GRP_READ  = "GRP_READ";
    public static final String GRP_WRITE = "GRP_WRITE";

    /** Spring Security authority names for groups (GROUP_ prefix) */
    public static final String GROUP_GRP_ADMIN = "GROUP_GRP_ADMIN";
    public static final String GROUP_GRP_READ  = "GROUP_GRP_READ";
    public static final String GROUP_GRP_WRITE = "GROUP_GRP_WRITE";
}
