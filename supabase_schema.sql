-- Run this in your Supabase SQL Editor

-- 1. Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    student_number TEXT,
    parent_number TEXT,
    class TEXT,
    section TEXT,
    institute_name TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    schedule JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create group_students (Many-to-Many junction table)
CREATE TABLE IF NOT EXISTS public.group_students (
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (group_id, student_id)
);

-- 4. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    status TEXT DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (group_id, student_id, session_date)
);

-- Note: We disable Row Level Security (RLS) for the sake of simplicity during this phase of development.
-- When you are ready for production, you should Enable RLS and define proper policies.
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance DISABLE ROW LEVEL SECURITY;
