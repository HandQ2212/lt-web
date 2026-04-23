package com.elc.system.modules.announcement.entity;

public enum AnnouncementScope {
    CENTER,      // MANAGER only: Toàn trung tâm
    ROLE,        // MANAGER only: Theo role (TEACHER, STUDENT, ...)
    CLASS,       // TEACHER: Class cụ thể
    FINANCE      // ACCOUNTANT: Finance-related (STUDENT, LEAD)
}
