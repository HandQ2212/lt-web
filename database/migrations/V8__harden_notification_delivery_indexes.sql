ALTER FUNCTION public.normalize_announcement_notification()
    SET search_path = public, pg_temp;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
    ON public.notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_enrollments_class_student_status
    ON public.enrollments(class_id, student_id, status);

CREATE INDEX IF NOT EXISTS idx_classes_teacher_id
    ON public.classes(teacher_id);

CREATE INDEX IF NOT EXISTS idx_announcements_created_by
    ON public.announcements(created_by_id);
