package com.elc.system.modules.auth.entity;

/**
 * Enumeration representing the various roles a user can have in the system.
 * Based on the user_role ENUM defined in the database schema.
 */
public enum UserRole {
    MANAGER,
    TEACHER,
    STUDENT,
    ACCOUNTANT,
    LEAD
}
