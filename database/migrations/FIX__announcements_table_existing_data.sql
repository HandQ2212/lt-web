-- =====================================================
-- FIX: Update existing announcements table for V4 migration
-- Run this before restarting the application
-- =====================================================

-- Step 1: Add new columns as NULLABLE first
DO $$
BEGIN
    -- Check if column exists before adding
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'announcements' AND column_name = 'created_by_id'
    ) THEN
        ALTER TABLE public.announcements ADD COLUMN created_by_id UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'announcements' AND column_name = 'scope'
    ) THEN
        ALTER TABLE public.announcements ADD COLUMN scope VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'announcements' AND column_name = 'delivered_at'
    ) THEN
        ALTER TABLE public.announcements ADD COLUMN delivered_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'announcements' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.announcements ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Step 2: Update existing data with default values
UPDATE public.announcements
SET
    created_by_id = COALESCE(
        created_by_id,
        (SELECT id FROM public.users WHERE role = 'MANAGER' LIMIT 1),
        (SELECT id FROM public.users LIMIT 1)
    )
WHERE created_by_id IS NULL;

UPDATE public.announcements
SET
    scope = COALESCE(scope, 'CENTER')
WHERE scope IS NULL;

UPDATE public.announcements
SET
    is_active = COALESCE(is_active, TRUE)
WHERE is_active IS NULL;

-- Step 3: Make columns NOT NULL (after data is updated)
DO $$
BEGIN
    -- Add foreign key constraint if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'announcements' AND constraint_name = 'fk_announcements_created_by'
    ) THEN
        ALTER TABLE public.announcements
        ADD CONSTRAINT fk_announcements_created_by
        FOREIGN KEY (created_by_id) REFERENCES public.users(id);
    END IF;

    -- Make columns NOT NULL
    ALTER TABLE public.announcements ALTER COLUMN created_by_id SET NOT NULL;
    ALTER TABLE public.announcements ALTER COLUMN scope SET NOT NULL;

    -- Add check constraints if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'announcements' AND constraint_name = 'chk_announcement_scope_role'
    ) THEN
        ALTER TABLE public.announcements
        ADD CONSTRAINT chk_announcement_scope_role
        CHECK (scope IN ('CENTER', 'ROLE', 'CLASS', 'FINANCE'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'announcements' AND constraint_name = 'chk_announcement_type'
    ) THEN
        ALTER TABLE public.announcements
        ADD CONSTRAINT chk_announcement_type
        CHECK (type IN ('URGENT', 'INFO', 'PROMO'));
    END IF;
END $$;

-- Step 4: Delete Flyway V4 record so migration can run properly
DELETE FROM public.flyway_schema_history WHERE version = '4';

-- Step 5: Verify the fix
SELECT
    'Fixed announcements table' AS status,
    COUNT(*) AS total_records,
    COUNT(created_by_id) AS has_created_by,
    COUNT(scope) AS has_scope
FROM public.announcements;

-- Expected output should show:
-- - total_records = has_created_by = has_scope (all columns populated)
