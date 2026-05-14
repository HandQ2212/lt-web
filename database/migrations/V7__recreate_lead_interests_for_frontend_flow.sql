-- Recreate lead_interests for the frontend lead-interest flow.
-- A lead can express interest in either one course or one class per row.

CREATE TABLE IF NOT EXISTS public.lead_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL,
    course_id UUID,
    clazz_id UUID,
    status VARCHAR NOT NULL DEFAULT 'INTERESTED',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT lead_interests_lead_id_fkey
        FOREIGN KEY (lead_id)
        REFERENCES public.leads(id)
        ON DELETE CASCADE,

    CONSTRAINT lead_interests_course_id_fkey
        FOREIGN KEY (course_id)
        REFERENCES public.courses(id)
        ON DELETE CASCADE,

    CONSTRAINT lead_interests_clazz_id_fkey
        FOREIGN KEY (clazz_id)
        REFERENCES public.classes(id)
        ON DELETE CASCADE,

    CONSTRAINT lead_interests_target_check
        CHECK (num_nonnulls(course_id, clazz_id) = 1),

    CONSTRAINT lead_interests_status_check
        CHECK (status IN ('NEW', 'INTERESTED', 'CONSULTING', 'CONTACTED', 'AGREED', 'PAID', 'CONVERTED', 'REJECTED'))
);

CREATE INDEX IF NOT EXISTS idx_lead_interests_lead_id
    ON public.lead_interests(lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_interests_course_id
    ON public.lead_interests(course_id)
    WHERE course_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_interests_clazz_id
    ON public.lead_interests(clazz_id)
    WHERE clazz_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_interests_status
    ON public.lead_interests(status);

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_interests_unique_course
    ON public.lead_interests(lead_id, course_id)
    WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_lead_interests_unique_class
    ON public.lead_interests(lead_id, clazz_id)
    WHERE clazz_id IS NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
          AND p.proname = 'update_updated_at_column'
    ) AND NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_lead_interests_updated_at'
    ) THEN
        CREATE TRIGGER update_lead_interests_updated_at
            BEFORE UPDATE ON public.lead_interests
            FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
    END IF;
END $$;
