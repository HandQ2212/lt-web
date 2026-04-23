-- =====================================================
-- ANNOUNCEMENTS TABLE
-- Stores system announcements (center-wide, role-based, class-specific)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.announcements (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Classification
    type VARCHAR(20) NOT NULL,      -- URGENT, INFO, PROMO
    scope VARCHAR(20) NOT NULL,     -- CENTER, ROLE, CLASS, FINANCE

    -- Targeting
    target_role VARCHAR(50),        -- MANAGER, TEACHER, STUDENT, ACCOUNTANT, LEAD
    target_class_id UUID,           -- For CLASS-scoped announcements

    -- Creator
    created_by_id UUID NOT NULL REFERENCES public.users(id),

    -- Timing
    expires_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_announcement_scope_role
        CHECK (scope IN ('CENTER', 'ROLE', 'CLASS', 'FINANCE')),
    CONSTRAINT chk_announcement_type
        CHECK (type IN ('URGENT', 'INFO', 'PROMO'))
);

-- Indexes for Performance
CREATE INDEX idx_announcements_created_by ON public.announcements(created_by_id);
CREATE INDEX idx_announcements_scope_role ON public.announcements(scope, target_role);
CREATE INDEX idx_announcements_active_expires ON public.announcements(is_active, expires_at);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);

-- Comments for Documentation
COMMENT ON TABLE public.announcements IS 'System announcements for targeted user groups';
COMMENT ON COLUMN public.announcements.type IS 'Announcement type: URGENT, INFO, PROMO';
COMMENT ON COLUMN public.announcements.scope IS 'Target scope: CENTER (all), ROLE (by role), CLASS (specific class), FINANCE (payment-related)';
COMMENT ON COLUMN public.announcements.target_role IS 'Target role when scope=ROLE';
COMMENT ON COLUMN public.announcements.target_class_id IS 'Target class when scope=CLASS';
COMMENT ON COLUMN public.announcements.delivered_at IS 'When notifications were delivered to users';
