-- Store the user who triggered a notification, when applicable.
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS created_by_id UUID;

ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS fk_notifications_created_by;

ALTER TABLE public.notifications
    ADD CONSTRAINT fk_notifications_created_by
    FOREIGN KEY (created_by_id)
    REFERENCES public.users(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_created_by
    ON public.notifications(created_by_id);
