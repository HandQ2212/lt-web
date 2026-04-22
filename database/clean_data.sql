-- ==========================================================
-- ELC MANAGEMENT SYSTEM - CLEAN DATA SCRIPT
-- WARNING: This will delete ALL data in the database
-- ==========================================================

-- Truncate all tables in correct order or use CASCADE
TRUNCATE TABLE 
    public.notifications,
    public.announcements,
    public.submissions,
    public.assignments,
    public.attendance,
    public.consultations,
    public.course_results,
    public.payments,
    public.transactions,
    public.invoices,
    public.enrollments,
    public.leads,
    public.class_schedules,
    public.classes,
    public.rooms,
    public.courses,
    public.users,
    public.branches,
    public.promotions,
    public.expenses
CASCADE;
