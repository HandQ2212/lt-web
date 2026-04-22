-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying NOT NULL,
  content text NOT NULL,
  target_role character varying,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.assignments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  class_id uuid,
  title character varying NOT NULL,
  description character varying,
  due_date timestamp with time zone NOT NULL,
  type character varying DEFAULT 'FILE_SUBMISSION'::assignment_type,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean,
  CONSTRAINT assignments_pkey PRIMARY KEY (id),
  CONSTRAINT assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT assignments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  class_id uuid,
  student_id uuid,
  session_date date NOT NULL,
  status character varying DEFAULT 'PRESENT'::attendance_status,
  notes character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  attendance_date date,
  present boolean NOT NULL,
  enrollment_id uuid NOT NULL,
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT fkfpxtsy79idkv1ot8h4w34r624 FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id),
  CONSTRAINT attendance_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id)
);
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  address character varying,
  phone character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  manager_id uuid,
  CONSTRAINT branches_pkey PRIMARY KEY (id),
  CONSTRAINT fkaxphe54ft6x2k2ndo8t5vsvjo FOREIGN KEY (manager_id) REFERENCES public.users(id)
);
CREATE TABLE public.class_schedules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  class_id uuid,
  day_of_week character varying NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  CONSTRAINT class_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT class_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  course_id uuid,
  teacher_id uuid,
  room_id uuid,
  name character varying NOT NULL,
  max_students integer NOT NULL,
  current_students integer DEFAULT 0,
  status character varying DEFAULT 'ACCEPTING'::class_status,
  start_date date NOT NULL,
  end_date date NOT NULL,
  meeting_url character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean,
  branch_id uuid,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT fktfq7dj1h7fbsrshdle005d5h5 FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT classes_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.users(id),
  CONSTRAINT classes_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  lead_id uuid,
  consultant_id uuid,
  consultation_date timestamp with time zone DEFAULT now(),
  notes character varying,
  next_step character varying,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  follow_up_date date,
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id),
  CONSTRAINT consultations_consultant_id_fkey FOREIGN KEY (consultant_id) REFERENCES public.users(id)
);
CREATE TABLE public.course_results (
  id uuid NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  comments text,
  final_grade character varying,
  final_score numeric,
  midterm_score numeric,
  other_scores jsonb,
  enrollment_id uuid NOT NULL UNIQUE,
  CONSTRAINT course_results_pkey PRIMARY KEY (id),
  CONSTRAINT fkkynh8a8fvfp84p7i2enl2yyho FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description character varying,
  level character varying DEFAULT 'BEGINNER'::course_level,
  duration_weeks integer NOT NULL DEFAULT 12,
  base_price numeric NOT NULL DEFAULT 0,
  max_students integer DEFAULT 25,
  curriculum_url character varying,
  status character varying DEFAULT 'ACTIVE'::course_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  class_id uuid,
  enrollment_date date DEFAULT now(),
  status character varying DEFAULT 'PENDING'::enrollment_status,
  notes character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category character varying NOT NULL,
  amount numeric NOT NULL,
  expense_date date DEFAULT CURRENT_DATE,
  vendor character varying,
  receipt_url character varying,
  approved_by uuid,
  notes character varying,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid,
  enrollment_id uuid,
  amount numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  due_date date NOT NULL,
  status character varying DEFAULT 'PENDING'::transaction_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  final_amount numeric NOT NULL,
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT invoices_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id)
);
CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  full_name character varying NOT NULL,
  email character varying,
  phone character varying NOT NULL,
  preferred_level character varying,
  assessment_score integer,
  status character varying DEFAULT 'NEW'::lead_status,
  source character varying DEFAULT 'WEBSITE_FORM'::lead_source,
  branch_id uuid,
  notes character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id),
  CONSTRAINT leads_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  title character varying NOT NULL,
  message character varying NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  amount numeric NOT NULL,
  notes text,
  payment_date timestamp with time zone,
  payment_method character varying NOT NULL CHECK (payment_method::text = ANY (ARRAY['CASH'::character varying, 'BANK_TRANSFER'::character varying, 'CREDIT_CARD'::character varying, 'MOMO'::character varying, 'VN_PAY'::character varying]::text[])),
  transaction_id character varying,
  invoice_id uuid NOT NULL,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT fkrbqec6be74wab8iifh8g3i50i FOREIGN KEY (invoice_id) REFERENCES public.invoices(id)
);
CREATE TABLE public.promotions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  type character varying NOT NULL,
  amount numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  expiry_date date,
  usage_limit integer DEFAULT 100,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promotions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  branch_id uuid,
  name character varying NOT NULL,
  capacity integer NOT NULL DEFAULT 30,
  status character varying DEFAULT 'AVAILABLE'::text,
  equipment jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  room_type character varying,
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  assignment_id uuid,
  student_id uuid,
  submission_date timestamp with time zone DEFAULT now(),
  file_url character varying,
  content text,
  grade numeric,
  feedback character varying,
  status character varying DEFAULT 'SUBMITTED'::submission_status,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT submissions_pkey PRIMARY KEY (id),
  CONSTRAINT submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id),
  CONSTRAINT submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  invoice_id uuid,
  student_id uuid,
  staff_id uuid,
  amount numeric NOT NULL,
  type character varying NOT NULL,
  method character varying DEFAULT 'QR'::transaction_method,
  description character varying,
  status character varying DEFAULT 'PENDING'::transaction_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id),
  CONSTRAINT transactions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(id),
  CONSTRAINT transactions_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  full_name character varying NOT NULL,
  phone character varying,
  date_of_birth date,
  gender character varying,
  address character varying,
  avatar_url character varying,
  role character varying DEFAULT 'STUDENT'::user_role,
  status character varying DEFAULT 'ACTIVE'::user_status,
  branch_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean,
  refresh_token character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);