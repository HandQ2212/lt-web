-- Refactor Course/Level/Class relation and remove deprecated tables/columns.

ALTER TABLE public.levels
    ADD COLUMN IF NOT EXISTS course_id UUID,
    ADD COLUMN IF NOT EXISTS base_price NUMERIC NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS duration_weeks INTEGER NOT NULL DEFAULT 12;

DO $$
DECLARE
    con RECORD;
BEGIN
    FOR con IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'levels'
          AND c.contype = 'u'
          AND pg_get_constraintdef(c.oid) = 'UNIQUE (code)'
    LOOP
        EXECUTE format('ALTER TABLE public.levels DROP CONSTRAINT IF EXISTS %I', con.conname);
    END LOOP;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'level'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'level_id'
        ) THEN
            INSERT INTO public.levels (id, course_id, code, name, description, display_order, base_price, duration_weeks, is_active, created_at, updated_at)
            SELECT
                uuid_generate_v4(),
                c.id,
                LEFT(COALESCE(NULLIF(UPPER(c.level::text), ''), 'DEFAULT'), 50),
                COALESCE(l.name, INITCAP(REPLACE(COALESCE(NULLIF(c.level::text, ''), 'Default'), '_', ' '))),
                COALESCE(l.description, c.description),
                COALESCE(l.display_order, 1),
                COALESCE(c.base_price, 0),
                COALESCE(c.duration_weeks, 12),
                TRUE,
                NOW(),
                NOW()
            FROM public.courses c
            LEFT JOIN public.levels l ON l.id = c.level_id
            WHERE NOT EXISTS (
                SELECT 1 FROM public.levels existing
                WHERE existing.course_id = c.id
            );
        ELSE
            INSERT INTO public.levels (id, course_id, code, name, description, display_order, base_price, duration_weeks, is_active, created_at, updated_at)
            SELECT
                uuid_generate_v4(),
                c.id,
                LEFT(COALESCE(NULLIF(UPPER(c.level::text), ''), 'DEFAULT'), 50),
                INITCAP(REPLACE(COALESCE(NULLIF(c.level::text, ''), 'Default'), '_', ' ')),
                c.description,
                1,
                COALESCE(c.base_price, 0),
                COALESCE(c.duration_weeks, 12),
                TRUE,
                NOW(),
                NOW()
            FROM public.courses c
            WHERE NOT EXISTS (
                SELECT 1 FROM public.levels existing
                WHERE existing.course_id = c.id
            );
        END IF;
    ELSE
        INSERT INTO public.levels (id, course_id, code, name, description, display_order, base_price, duration_weeks, is_active, created_at, updated_at)
        SELECT
            uuid_generate_v4(),
            c.id,
            'DEFAULT',
            'Default',
            c.description,
            1,
            0,
            12,
            TRUE,
            NOW(),
            NOW()
        FROM public.courses c
        WHERE NOT EXISTS (
            SELECT 1 FROM public.levels existing
            WHERE existing.course_id = c.id
        );
    END IF;
END $$;

ALTER TABLE public.classes
    ADD COLUMN IF NOT EXISTS level_id UUID;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'classes' AND column_name = 'course_id'
    ) THEN
        UPDATE public.classes cls
        SET level_id = (
            SELECT l.id
            FROM public.levels l
            WHERE l.course_id = cls.course_id
            ORDER BY l.display_order NULLS LAST, l.created_at NULLS LAST, l.id
            LIMIT 1
        )
        WHERE cls.level_id IS NULL;
    END IF;
END $$;

DO $$
DECLARE
    item RECORD;
    con RECORD;
BEGIN
    FOR item IN
        SELECT *
        FROM (VALUES
            ('courses', 'level_id'),
            ('classes', 'course_id'),
            ('attendance', 'class_id'),
            ('attendance', 'student_id'),
            ('invoices', 'student_id'),
            ('expenses', 'category_id')
        ) AS v(table_name, column_name)
    LOOP
        FOR con IN
            SELECT c.conname
            FROM pg_constraint c
            JOIN pg_class t ON t.oid = c.conrelid
            JOIN pg_namespace n ON n.oid = t.relnamespace
            JOIN unnest(c.conkey) AS cols(attnum) ON TRUE
            JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = cols.attnum
            WHERE n.nspname = 'public'
              AND t.relname = item.table_name
              AND a.attname = item.column_name
        LOOP
            EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', item.table_name, con.conname);
        END LOOP;
    END LOOP;
END $$;

DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.lead_interests CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.staff_adjustments CASCADE;
DROP TABLE IF EXISTS public.promotions CASCADE;

ALTER TABLE public.expenses
    DROP COLUMN IF EXISTS branch_id,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS category_id;

DROP TABLE IF EXISTS public.expense_categories CASCADE;

ALTER TABLE public.users
    DROP COLUMN IF EXISTS is_active;

ALTER TABLE public.classes
    DROP COLUMN IF EXISTS course_id,
    DROP COLUMN IF EXISTS meeting_url,
    DROP COLUMN IF EXISTS is_active;

ALTER TABLE public.courses
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS level_id,
    DROP COLUMN IF EXISTS base_price,
    DROP COLUMN IF EXISTS duration_weeks,
    DROP COLUMN IF EXISTS max_students,
    DROP COLUMN IF EXISTS curriculum_url,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS is_active;

ALTER TABLE public.attendance
    DROP COLUMN IF EXISTS class_id,
    DROP COLUMN IF EXISTS student_id,
    DROP COLUMN IF EXISTS session_date,
    DROP COLUMN IF EXISTS present;

ALTER TABLE public.invoices
    DROP COLUMN IF EXISTS student_id,
    DROP COLUMN IF EXISTS amount,
    DROP COLUMN IF EXISTS paid_amount,
    DROP COLUMN IF EXISTS payment_method,
    DROP COLUMN IF EXISTS notes;

ALTER TABLE public.leads
    DROP COLUMN IF EXISTS user_id;

ALTER TABLE public.rooms
    DROP COLUMN IF EXISTS equipment,
    DROP COLUMN IF EXISTS room_type;

DELETE FROM public.levels
WHERE course_id IS NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'levels_course_id_fkey'
    ) THEN
        ALTER TABLE public.levels
            ADD CONSTRAINT levels_course_id_fkey
            FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'classes_level_id_fkey'
    ) THEN
        ALTER TABLE public.classes
            ADD CONSTRAINT classes_level_id_fkey
            FOREIGN KEY (level_id) REFERENCES public.levels(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_levels_course_id ON public.levels(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_levels_course_code_unique ON public.levels(course_id, LOWER(code));
CREATE INDEX IF NOT EXISTS idx_classes_level_id ON public.classes(level_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.classes WHERE level_id IS NULL) THEN
        ALTER TABLE public.classes ALTER COLUMN level_id SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.levels WHERE course_id IS NULL) THEN
        ALTER TABLE public.levels ALTER COLUMN course_id SET NOT NULL;
    END IF;
END $$;

DO $$
DECLARE
    con RECORD;
BEGIN
    FOR con IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'notifications'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%type%'
    LOOP
        EXECUTE format('ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS %I', con.conname);
    END LOOP;
END $$;

ALTER TABLE public.notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IS NULL OR type IN ('PERSONAL', 'ANNOUNCEMENT', 'SYSTEM', 'GRADE_PUBLISHED'));

CREATE OR REPLACE FUNCTION public.update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'ACTIVE') THEN
        UPDATE public.classes SET current_students = current_students + 1 WHERE id = NEW.class_id;
    ELSIF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE')) THEN
        UPDATE public.classes SET current_students = GREATEST(0, current_students - 1) WHERE id = OLD.class_id;
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE') THEN
        UPDATE public.classes SET current_students = current_students + 1 WHERE id = NEW.class_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_enrollment_change ON public.enrollments;
CREATE TRIGGER on_enrollment_change
    AFTER INSERT OR UPDATE OR DELETE ON public.enrollments
    FOR EACH ROW EXECUTE PROCEDURE public.update_class_student_count();

UPDATE public.classes cls
SET current_students = active_counts.count
FROM (
    SELECT class_id, COUNT(*)::INTEGER AS count
    FROM public.enrollments
    WHERE status = 'ACTIVE'
    GROUP BY class_id
) active_counts
WHERE cls.id = active_counts.class_id;

UPDATE public.classes cls
SET current_students = 0
WHERE NOT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.class_id = cls.id
      AND e.status = 'ACTIVE'
);
