-- ==========================================================
-- ELC MANAGEMENT SYSTEM - COMPREHENSIVE DUMMY DATA SCRIPT
-- Password for all users: password123
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. BRANCHES
INSERT INTO public.branches (id, name, address, phone) 
VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'ELC Main Center', '123 District 1, HCM City', '0123456789'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'ELC East Branch', '456 Thu Duc, HCM City', '0987654321')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS
INSERT INTO public.users (id, email, password_hash, full_name, phone, role, status, branch_id)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin@elc.com', crypt('password123', gen_salt('bf')), 'System Admin', '0900000001', 'MANAGER', 'ACTIVE', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'teacher@elc.com', crypt('password123', gen_salt('bf')), 'Mr. John Smith', '0900000002', 'TEACHER', 'ACTIVE', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'finance@elc.com', crypt('password123', gen_salt('bf')), 'Ms. Sarah Lee', '0900000003', 'ACCOUNTANT', 'ACTIVE', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'student1@gmail.com', crypt('password123', gen_salt('bf')), 'Nguyen Van A', '0900000004', 'STUDENT', 'ACTIVE', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'student2@gmail.com', crypt('password123', gen_salt('bf')), 'Tran Thi B', '0900000005', 'STUDENT', 'ACTIVE', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- 3. COURSES
INSERT INTO public.courses (id, name, description, level, duration_weeks, base_price, status)
VALUES 
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IELTS Foundation', 'Beginner IELTS course', 'BEGINNER', 12, 4500000, 'ACTIVE'),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Communication Mastery', 'Intermediate English', 'INTERMEDIATE', 10, 3500000, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 4. ROOMS
INSERT INTO public.rooms (id, branch_id, name, capacity, status)
VALUES 
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Room 101', 20, 'AVAILABLE'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Room 102', 25, 'AVAILABLE')
ON CONFLICT (id) DO NOTHING;

-- 5. CLASSES
INSERT INTO public.classes (id, course_id, teacher_id, room_id, branch_id, name, max_students, current_students, status, start_date, end_date)
VALUES 
('00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IELTS-F-01', 20, 2, 'ACCEPTING', '2024-05-01', '2024-08-01')
ON CONFLICT (id) DO NOTHING;

-- 6. CLASS SCHEDULES
INSERT INTO public.class_schedules (id, class_id, day_of_week, start_time, end_time)
VALUES 
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'MON', '18:00:00', '20:00:00'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'WED', '18:00:00', '20:00:00')
ON CONFLICT (id) DO NOTHING;

-- 7. ENROLLMENTS
INSERT INTO public.enrollments (id, student_id, class_id, enrollment_date, status)
VALUES 
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-04-15', 'ACTIVE'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-04-16', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 8. INVOICES (Includes final_amount)
INSERT INTO public.invoices (id, student_id, enrollment_id, amount, discount_amount, total_amount, final_amount, due_date, status)
VALUES 
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4500000, 500000, 4000000, 4000000, '2024-05-15', 'PENDING'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 4500000, 0, 4500000, 4500000, '2024-05-15', 'PENDING')
ON CONFLICT (id) DO NOTHING;

-- 9. PAYMENTS
INSERT INTO public.payments (id, invoice_id, amount, payment_method, payment_date, notes)
VALUES 
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2000000, 'BANK_TRANSFER', NOW(), 'Deposit payment'),
(gen_random_uuid(), '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 4500000, 'CASH', NOW(), 'Full payment')
ON CONFLICT (id) DO NOTHING;

-- 10. LEADS
INSERT INTO public.leads (id, full_name, email, phone, status, source, branch_id)
VALUES 
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Tran Van C', 'vanc@gmail.com', '0911223344', 'NEW', 'WEBSITE_FORM', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Le Thi D', 'thid@gmail.com', '0955667788', 'INTERESTED', 'REFERRAL', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT (id) DO NOTHING;

-- 11. CONSULTATIONS
INSERT INTO public.consultations (id, lead_id, consultant_id, consultation_date, notes, next_step)
VALUES 
(gen_random_uuid(), '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW(), 'Interested in IELTS', 'Schedule placement test')
ON CONFLICT (id) DO NOTHING;

-- 12. ATTENDANCE
INSERT INTO public.attendance (id, class_id, student_id, enrollment_id, session_date, status, present)
VALUES 
(gen_random_uuid(), '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-05-01', 'PRESENT', true),
(gen_random_uuid(), '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', '2024-05-01', 'ABSENT', false)
ON CONFLICT (id) DO NOTHING;

-- 13. ASSIGNMENTS
INSERT INTO public.assignments (id, class_id, title, description, due_date, created_by)
VALUES 
('40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '00eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'IELTS Writing Task 1', 'Submit your essay', '2024-05-10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
ON CONFLICT (id) DO NOTHING;

-- 14. SUBMISSIONS
INSERT INTO public.submissions (id, assignment_id, student_id, submission_date, content, status)
VALUES 
(gen_random_uuid(), '40eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', NOW(), 'My essay content...', 'SUBMITTED')
ON CONFLICT (id) DO NOTHING;

-- 15. COURSE RESULTS
INSERT INTO public.course_results (id, enrollment_id, midterm_score, final_score, comments)
VALUES 
(gen_random_uuid(), '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 8.5, 9.0, 'Excellent performance')
ON CONFLICT (id) DO NOTHING;
