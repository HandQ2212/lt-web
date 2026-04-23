-- =====================================================
-- MIGRATE FIX: Convert announcements table - Handle NULL values
-- Step-by-step với NULL handling
-- =====================================================

-- Step 1: Rename columns (safe operation)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'content') THEN
        ALTER TABLE public.announcements RENAME COLUMN content TO message;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'created_by') THEN
        ALTER TABLE public.announcements RENAME COLUMN created_by TO created_by_id;
    END IF;
END $$;

-- Step 2: Add new columns (nullable - safe)
ALTER TABLE public.announcements
    ADD COLUMN IF NOT EXISTS type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS scope VARCHAR(20),
    ADD COLUMN IF NOT EXISTS target_class_id UUID,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Step 3: ⚠️ FIX NULL created_by_id FIRST before making NOT NULL
UPDATE public.announcements
SET created_by_id = (
    SELECT id FROM public.users
    WHERE role = 'MANAGER'
    ORDER BY created_at
    LIMIT 1
)
WHERE created_by_id IS NULL;

-- Verify không còn NULL values
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count
    FROM public.announcements
    WHERE created_by_id IS NULL;

    IF null_count > 0 THEN
        RAISE EXCEPTION 'Still have % NULL created_by_id values. Please check users table has at least one MANAGER', null_count;
    END IF;
END $$;

-- Step 4: Update other NULL columns to defaults
UPDATE public.announcements
SET
    type = COALESCE(type, 'INFO'),
    scope = COALESCE(scope, 'CENTER')
WHERE type IS NULL OR scope IS NULL;

-- Step 5: Convert target_role type (safe operation)
ALTER TABLE public.announcements
    ALTER COLUMN target_role TYPE VARCHAR(50)
    USING target_role::text;

-- Step 6: Drop old constraints if exist
ALTER TABLE public.announcements
    DROP CONSTRAINT IF EXISTS announcements_target_role_check,
    DROP CONSTRAINT IF EXISTS chk_announcement_type,
    DROP CONSTRAINT IF EXISTS chk_announcement_scope_role;

-- Step 7: Make columns NOT NULL (sau khi đã handle NULL)
ALTER TABLE public.announcements
    ALTER COLUMN created_by_id SET NOT NULL,
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN scope SET NOT NULL;

-- Step 8: Add new constraints
ALTER TABLE public.announcements
    ADD CONSTRAINT chk_announcement_scope
    CHECK (scope IN ('CENTER', 'ROLE', 'CLASS', 'FINANCE')),
    ADD CONSTRAINT chk_announcement_type
    CHECK (type IN ('URGENT', 'INFO', 'PROMO'));

-- Step 9: Update notifications table
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PERSONAL';

-- Drop old constraint nếu có
ALTER TABLE public.notifications
    DROP CONSTRAINT IF EXISTS chk_notification_type;

-- Add new constraint
ALTER TABLE public.notifications
    ADD CONSTRAINT chk_notification_type
    CHECK (type IN ('PERSONAL', 'ANNOUNCEMENT', 'SYSTEM'));

-- Step 10: Delete Flyway migration records
DELETE FROM public.flyway_schema_history WHERE version IN ('3', '4');

-- Step 11: FINAL VERIFY
SELECT
    '=== MIGRATION COMPLETE ===' AS status,
    COUNT(*) AS total_announcements,
    COUNT(created_by_id) AS has_created_by,
    COUNT(type) AS has_type,
    COUNT(scope) AS has_scope,
    COUNT(*) - COUNT(created_by_id) AS null_created_by,
    COUNT(*) - COUNT(type) AS null_type,
    COUNT(*) - COUNT(scope) AS null_scope
FROM public.announcements;

-- Expected: null_created_by = null_type = null_scope = 0
