-- ==========================================================
-- ELC MANAGEMENT SYSTEM - DATABASE INITIALIZATION SCRIPT
-- Specialized for Custom Backend (Independent of Supabase Auth)
-- Version: 1.1 (Final Polish & Enhanced Automation)
-- ==========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('MANAGER', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'LEAD');
    CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'DEACTIVATED');
    CREATE TYPE course_level AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
    CREATE TYPE course_status AS ENUM ('ACTIVE', 'INACTIVE', 'UPCOMING');
    CREATE TYPE class_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
    CREATE TYPE enrollment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'DROPPED');
    CREATE TYPE assignment_type AS ENUM ('FILE_SUBMISSION', 'QUIZ', 'ESSAY');
    CREATE TYPE submission_status AS ENUM ('SUBMITTED', 'GRADED', 'RETURNED');
    CREATE TYPE transaction_type AS ENUM ('COURSE_FEE', 'SALARY', 'EXPENSE');
    CREATE TYPE transaction_method AS ENUM ('QR', 'TRANSFER', 'CASH', 'ONLINE');
    CREATE TYPE transaction_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'REFUNDED');
    CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'INTERESTED', 'ENROLLED', 'REJECTED');
    CREATE TYPE lead_source AS ENUM ('WEBSITE_FORM', 'REFERRAL', 'WALKIN');
    CREATE TYPE attendance_status AS ENUM ('PRESENT', 'ABSENT', 'LATE');
    CREATE TYPE day_of_week AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES

-- 3.1 Branches
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Users
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    address TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'STUDENT',
    status user_status DEFAULT 'ACTIVE',
    branch_id UUID REFERENCES public.branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Classrooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES public.branches(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    status TEXT DEFAULT 'AVAILABLE',
    equipment JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    level course_level DEFAULT 'BEGINNER',
    duration_weeks INTEGER NOT NULL DEFAULT 12,
    base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    max_students INTEGER DEFAULT 25,
    curriculum_url TEXT,
    status course_status DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Classes
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.users(id),
    room_id UUID REFERENCES public.rooms(id),
    name TEXT NOT NULL,
    max_students INTEGER NOT NULL,
    current_students INTEGER DEFAULT 0,
    status class_status DEFAULT 'UPCOMING',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    meeting_url TEXT, -- For Online/Hybrid support
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 Class Schedules
CREATE TABLE IF NOT EXISTS public.class_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    day_of_week day_of_week NOT NULL,
    schedule_date DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE(class_id, day_of_week, start_time)
);

-- 3.7 Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMPTZ DEFAULT NOW(),
    status enrollment_status DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- 3.8 Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status attendance_status DEFAULT 'PRESENT',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(enrollment_id, attendance_date)
);

-- 3.9 Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    type assignment_type DEFAULT 'FILE_SUBMISSION',
    attachments JSONB DEFAULT '[]',
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    file_url TEXT,
    content TEXT,
    grade DECIMAL(5, 2),
    feedback TEXT,
    status submission_status DEFAULT 'SUBMITTED',
    is_late BOOLEAN DEFAULT FALSE,
    late_minutes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.11 Leads (CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    preferred_level course_level,
    assessment_score INTEGER,
    status lead_status DEFAULT 'NEW',
    source lead_source DEFAULT 'WEBSITE_FORM',
    branch_id UUID REFERENCES public.branches(id), -- Track interest location
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.12 Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    consultant_id UUID REFERENCES public.users(id),
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    next_step TEXT
);

-- 3.13 Promotions & Discounts
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- e.g., 'PERCENTAGE', 'FIXED_AMOUNT'
    amount DECIMAL(12, 2) NOT NULL,
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    expiry_date DATE,
    usage_limit INTEGER DEFAULT 100,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.14 Financial: Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id),
    enrollment_id UUID REFERENCES public.enrollments(id),
    amount DECIMAL(12, 2) NOT NULL,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status transaction_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.15 Financial: Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.invoices(id),
    student_id UUID REFERENCES public.users(id),
    staff_id UUID REFERENCES public.users(id),
    amount DECIMAL(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    method transaction_method DEFAULT 'QR',
    description TEXT,
    status transaction_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.16 Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    vendor TEXT,
    receipt_url TEXT,
    approved_by UUID REFERENCES public.users(id),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.17 Announcements
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    scope TEXT NOT NULL,
    target_role user_role,
    target_class_id UUID REFERENCES public.classes(id),
    created_by_id UUID REFERENCES public.users(id),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.17b Password Reset Tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.18 Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FUNCTIONS & TRIGGERS

-- 4.1 Handle Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all relevant tables
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON enrollments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON submissions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_password_reset_tokens_updated_at BEFORE UPDATE ON password_reset_tokens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4.2 Update Class Student Count
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT' AND NEW.status = 'ACTIVE') THEN
        UPDATE classes SET current_students = current_students + 1 WHERE id = NEW.class_id;
    ELSIF (TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE')) THEN
        UPDATE classes SET current_students = GREATEST(0, current_students - 1) WHERE id = OLD.class_id;
    ELSIF (TG_OP = 'UPDATE' AND NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE') THEN
        UPDATE classes SET current_students = current_students + 1 WHERE id = NEW.class_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_enrollment_change
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW EXECUTE PROCEDURE update_class_student_count();

-- 5. ACCESS CONTROL (RLS)
-- Enabled but minimal for custom backend management.
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. SEED DATA

INSERT INTO public.branches (id, name, address, phone) 
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Main Center', '123 District 1, HCM City', '0123456789')
ON CONFLICT DO NOTHING;

INSERT INTO public.courses (name, description, level, duration_weeks, base_price)
VALUES 
('IELTS Intensive', 'High-intensity IELTS preparation', 'ADVANCED', 12, 5000000),
('General English', 'Communicate with confidence', 'BEGINNER', 8, 2500000),
('Business Communication', 'Master the workspace language', 'INTERMEDIATE', 10, 3500000)
ON CONFLICT DO NOTHING;

INSERT INTO public.promotions (code, type, amount, min_purchase, expiry_date)
VALUES 
('SUMMER2024', 'PERCENTAGE', 20.00, 1000000, '2024-08-31'),
('ELCNEW500', 'FIXED_AMOUNT', 500000.00, 3000000, '2024-12-31')
ON CONFLICT DO NOTHING;


-- 1. Thêm refresh_token column vào bảng users                                                                                           
  ALTER TABLE public.users                                                                                                                 
  ADD COLUMN IF NOT EXISTS refresh_token VARCHAR(255);                                                                                     
                                                                                                                                           
  -- 2. Tạo index cho email (tăng tốc độ login)                                                                                            
  CREATE INDEX IF NOT EXISTS idx_users_email                                                                                               
  ON public.users(email);
                                                                                                                                           
  -- 3. Tạo index cho refresh_token (tăng tốc độ refresh token validation)
  CREATE INDEX IF NOT EXISTS idx_users_refresh_token
  ON public.users(refresh_token);                

  -- 4. Verify changes - Kiểm tra kết quả
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'users'
  AND column_name IN ('email', 'password_hash', 'refresh_token');
