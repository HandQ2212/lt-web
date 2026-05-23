-- FILE NÀY CHỈ DÙNG ĐỂ REVERSE VÀO VISUAL PARADIGM
-- ĐÃ LOẠI BỎ CÁC LỆNH PHỨC TẠP NHƯ TRIGGER, FUNCTION, DO BLOCK

CREATE TABLE branches (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    address text,
    phone text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE users (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    phone text,
    date_of_birth date,
    gender text,
    address text,
    avatar_url text,
    role text, -- VP sẽ nhận diện tốt hơn nếu để kiểu text thay vì Enum
    status text,
    branch_id uuid REFERENCES branches(id),
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE rooms (
    id uuid PRIMARY KEY,
    branch_id uuid REFERENCES branches(id),
    name text NOT NULL,
    capacity integer,
    status text,
    equipment jsonb,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE courses (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text,
    level text,
    duration_weeks integer,
    base_price numeric(12, 2),
    max_students integer,
    curriculum_url text,
    status text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE classes (
    id uuid PRIMARY KEY,
    course_id uuid REFERENCES courses(id),
    teacher_id uuid REFERENCES users(id),
    room_id uuid REFERENCES rooms(id),
    name text NOT NULL,
    max_students integer,
    current_students integer,
    status text,
    start_date date,
    end_date date,
    meeting_url text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE class_schedules (
    id uuid PRIMARY KEY,
    class_id uuid REFERENCES classes(id),
    day_of_week text,
    schedule_date date,
    start_time time,
    end_time time
);

CREATE TABLE enrollments (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES users(id),
    class_id uuid REFERENCES classes(id),
    enrollment_date timestamptz,
    status text,
    notes text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE attendance (
    id uuid PRIMARY KEY,
    class_id uuid REFERENCES classes(id),
    student_id uuid REFERENCES users(id),
    session_date date,
    status text,
    notes text,
    created_at timestamptz
);

CREATE TABLE assignments (
    id uuid PRIMARY KEY,
    class_id uuid REFERENCES classes(id),
    title text NOT NULL,
    description text,
    due_date timestamptz,
    type text,
    attachments jsonb,
    created_by uuid REFERENCES users(id),
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE submissions (
    id uuid PRIMARY KEY,
    assignment_id uuid REFERENCES assignments(id),
    student_id uuid REFERENCES users(id),
    submission_date timestamptz,
    file_url text,
    content text,
    grade numeric(5, 2),
    feedback text,
    status text,
    updated_at timestamptz
);

CREATE TABLE leads (
    id uuid PRIMARY KEY,
    full_name text NOT NULL,
    email text,
    phone text NOT NULL,
    preferred_level text,
    assessment_score integer,
    status text,
    source text,
    branch_id uuid REFERENCES branches(id),
    notes text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE consultations (
    id uuid PRIMARY KEY,
    lead_id uuid REFERENCES leads(id),
    consultant_id uuid REFERENCES users(id),
    consultation_date timestamptz,
    notes text,
    next_step text
);

CREATE TABLE promotions (
    id uuid PRIMARY KEY,
    code text UNIQUE NOT NULL,
    type text,
    amount numeric(12, 2),
    min_purchase numeric(12, 2),
    expiry_date date,
    usage_limit integer,
    usage_count integer,
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE invoices (
    id uuid PRIMARY KEY,
    student_id uuid REFERENCES users(id),
    enrollment_id uuid REFERENCES enrollments(id),
    amount numeric(12, 2),
    discount_amount numeric(12, 2),
    total_amount numeric(12, 2),
    due_date date,
    status text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE transactions (
    id uuid PRIMARY KEY,
    invoice_id uuid REFERENCES invoices(id),
    student_id uuid REFERENCES users(id),
    staff_id uuid REFERENCES users(id),
    amount numeric(12, 2),
    type text,
    method text,
    description text,
    status text,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE expenses (
    id uuid PRIMARY KEY,
    category text,
    amount numeric(12, 2),
    expense_date date,
    vendor text,
    receipt_url text,
    approved_by uuid REFERENCES users(id),
    notes text,
    updated_at timestamptz
);

CREATE TABLE announcements (
    id uuid PRIMARY KEY,
    title text NOT NULL,
    content text,
    target_role text,
    created_by uuid REFERENCES users(id),
    is_active boolean,
    created_at timestamptz,
    updated_at timestamptz
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users(id),
    title text,
    message text,
    is_read boolean,
    created_at timestamptz
);
