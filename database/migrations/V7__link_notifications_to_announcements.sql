ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS announcement_id UUID;

ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS fk_notifications_announcement;

ALTER TABLE public.notifications
    ADD CONSTRAINT fk_notifications_announcement
    FOREIGN KEY (announcement_id)
    REFERENCES public.announcements(id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_notifications_announcement
    ON public.notifications(announcement_id);

WITH matched_announcements AS (
    SELECT DISTINCT ON (n.id)
        n.id AS notification_id,
        a.id AS announcement_id,
        a.created_by_id
    FROM public.notifications n
    JOIN public.announcements a
      ON a.title = n.title
     AND a.message = n.message
     AND n.type = 'ANNOUNCEMENT'
     AND n.created_at BETWEEN a.created_at - INTERVAL '2 seconds' AND a.created_at + INTERVAL '15 seconds'
    ORDER BY n.id, ABS(EXTRACT(EPOCH FROM (n.created_at - a.created_at)))
)
UPDATE public.notifications n
SET announcement_id = matched_announcements.announcement_id,
    created_by_id = COALESCE(n.created_by_id, matched_announcements.created_by_id)
FROM matched_announcements
WHERE n.id = matched_announcements.notification_id;

DELETE FROM public.notifications n
USING public.announcements a
WHERE n.announcement_id = a.id
  AND a.scope = 'CLASS'
  AND NOT EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.users u ON u.id = e.student_id
      WHERE e.class_id = a.target_class_id
        AND e.student_id = n.user_id
        AND e.status IN ('PENDING', 'APPROVED', 'ACTIVE')
        AND u.status = 'ACTIVE'
  );

CREATE OR REPLACE FUNCTION public.normalize_announcement_notification()
RETURNS trigger AS $$
DECLARE
    source_id UUID;
    source_scope TEXT;
    source_target_class_id UUID;
    source_created_by_id UUID;
BEGIN
    IF NEW.type IS DISTINCT FROM 'ANNOUNCEMENT' THEN
        RETURN NEW;
    END IF;

    IF NEW.announcement_id IS NOT NULL THEN
        SELECT a.id, a.scope, a.target_class_id, a.created_by_id
        INTO source_id, source_scope, source_target_class_id, source_created_by_id
        FROM public.announcements a
        WHERE a.id = NEW.announcement_id;
    ELSE
        SELECT a.id, a.scope, a.target_class_id, a.created_by_id
        INTO source_id, source_scope, source_target_class_id, source_created_by_id
        FROM public.announcements a
        WHERE a.title = NEW.title
          AND a.message = NEW.message
          AND a.created_at >= now() - INTERVAL '10 minutes'
        ORDER BY a.created_at DESC
        LIMIT 1;
    END IF;

    IF source_id IS NULL THEN
        RETURN NEW;
    END IF;

    NEW.announcement_id := source_id;
    NEW.created_by_id := COALESCE(NEW.created_by_id, source_created_by_id);

    IF source_scope = 'CLASS' THEN
        IF source_target_class_id IS NULL OR NOT EXISTS (
            SELECT 1
            FROM public.enrollments e
            JOIN public.users u ON u.id = e.student_id
            WHERE e.class_id = source_target_class_id
              AND e.student_id = NEW.user_id
              AND e.status IN ('PENDING', 'APPROVED', 'ACTIVE')
              AND u.status = 'ACTIVE'
        ) THEN
            RETURN NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_normalize_announcement_notification
    ON public.notifications;

CREATE TRIGGER trg_normalize_announcement_notification
BEFORE INSERT OR UPDATE OF announcement_id, created_by_id, user_id, title, message, type
ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.normalize_announcement_notification();
