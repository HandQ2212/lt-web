-- =====================================================
-- MIGRATE: Convert existing announcements table to new structure
-- Dựa trên init_database.sql structure → Milestone 2 structure
-- KHÔNG XÓA DATA CHỈ ALTER TABLE
-- =====================================================

-- Step 1: Rename existing columns để khớp với code mới
DO $$
BEGIN
    -- Rename content → message
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'content') THEN
        ALTER TABLE public.announcements RENAME COLUMN content TO message;
    END IF;

    -- Rename created_by → created_by_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'announcements' AND column_name = 'created_by') THEN
        ALTER TABLE public.announcements RENAME COLUMN created_by TO created_by_id;
    END IF;
END $$;

-- Step 2: Add new columns (nullable first)
ALTER TABLE public.announcements
    ADD COLUMN IF NOT EXISTS type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS scope VARCHAR(20),
    ADD COLUMN IF NOT EXISTS target_class_id UUID,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- Step 3: Update existing data with default values
UPDATE public.announcements
SET
    type = COALESCE(type, 'INFO'),
    scope = COALESCE(scope, 'CENTER')
WHERE type IS NULL OR scope IS NULL;

-- Step 4: Convert target_role từ ENUM user_role → VARCHAR
-- (PostgreSQL tự động convert khi chúng ta set data type)
ALTER TABLE public.announcements
    ALTER COLUMN target_role TYPE VARCHAR(50)
    USING target_role::text;

-- Step 5: Make columns NOT NULL (sau khi đã có data)
ALTER TABLE public.announcements
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN scope SET NOT NULL,
    ALTER COLUMN created_by_id SET NOT NULL;

-- Step 6: Drop old check constraint nếu có (do user_role ENUM)
ALTER TABLE public.announcements
    DROP CONSTRAINT IF EXISTS announcements_target_role_check;

-- Step 7: Add new check constraints
ALTER TABLE public.announcements
    ADD CONSTRAINT chk_announcement_scope
    CHECK (scope IN ('CENTER', 'ROLE', 'CLASS', 'FINANCE')),
    ADD CONSTRAINT chk_announcement_type
    CHECK (type IN ('URGENT', 'INFO', 'PROMO'));

-- Step 8: Update notifications table structure
-- Add column 'type' nếu chưa có
ALTER TABLE public.notifications
    ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'PERSONAL';

-- Add check constraint cho notifications
ALTER TABLE public.notifications
    ADD CONSTRAINT chk_notification_type
    CHECK (type IN ('PERSONAL', 'ANNOUNCEMENT', 'SYSTEM'));

-- Step 9: Delete Flyway migration records để chạy lại
DELETE FROM public.flyway_schema_history WHERE version IN ('3', '4');

-- Step 10: Verify migration results
SELECT
    'Announcements table migrated' AS status,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'announcements'
ORDER BY ordinal_position;

-- Expected output:
-- column_name     | data_type                   | is_nullable
-- ----------------|-----------------------------|-------------
-- id              | uuid                        | NO
-- title           | text                        | NO
-- message         | text                        | NO          (renamed from content)
-- type            | character varying           | NO          (new)
-- scope           | character varying           | NO          (new)
-- target_role     | character varying           | YES         (converted from ENUM)
-- target_class_id | uuid                        | YES         (new)
-- created_by_id   | uuid                        | NO          (renamed from created_by)
-- expires_at      | timestamp without time zone  | YES         (new)
-- delivered_at    | timestamp without time zone  | YES         (new)
-- is_active       | boolean                     | YES
-- created_at      | timestamp without time zone  | YES
-- updated_at      | timestamp without time zone  | YES
