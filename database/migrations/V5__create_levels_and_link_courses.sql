-- ==========================================================
-- V5: Create levels table and link courses to levels
-- Compatible with existing schema where courses.level uses enum/text values
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.levels (code, name, description, display_order, is_active)
VALUES
    ('BEGINNER', 'Beginner', 'Entry level', 1, TRUE),
    ('INTERMEDIATE', 'Intermediate', 'Middle level', 2, TRUE),
    ('ADVANCED', 'Advanced', 'Upper level', 3, TRUE)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.courses
    ADD COLUMN IF NOT EXISTS level_id UUID;

-- Backfill courses.level_id from legacy courses.level enum/text when present.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'courses'
          AND column_name = 'level'
    ) THEN
        UPDATE public.courses c
        SET level_id = l.id
        FROM public.levels l
        WHERE c.level_id IS NULL
          AND UPPER(c.level::text) = l.code;
    END IF;
END $$;

-- Fallback any remaining NULL level_id to BEGINNER.
UPDATE public.courses c
SET level_id = l.id
FROM public.levels l
WHERE c.level_id IS NULL
  AND l.code = 'BEGINNER';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_courses_level_id'
    ) THEN
        ALTER TABLE public.courses
            ADD CONSTRAINT fk_courses_level_id
            FOREIGN KEY (level_id)
            REFERENCES public.levels(id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_courses_level_id
    ON public.courses(level_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'update_levels_updated_at'
    ) THEN
        CREATE TRIGGER update_levels_updated_at
            BEFORE UPDATE ON public.levels
            FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
    END IF;
END $$;
