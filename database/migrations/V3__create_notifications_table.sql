-- =====================================================
-- NOTIFICATIONS TABLE
-- Stores user notifications (personal, system, and announcements)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign Keys
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    type VARCHAR(20) DEFAULT 'PERSONAL',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- Comments for Documentation
COMMENT ON TABLE public.notifications IS 'User notifications (personal, system, and announcement)';
COMMENT ON COLUMN public.notifications.type IS 'Notification type: PERSONAL, ANNOUNCEMENT, SYSTEM';
COMMENT ON COLUMN public.notifications.is_read IS 'Read status flag';
