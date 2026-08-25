-- ==============================================================================
-- MONEY TRACKER SUPABASE DATABASE SCHEMA (FULL MULTI-DEVICE SYNC)
-- ==============================================================================
-- Paste and run this script in your Supabase SQL Editor:
-- https://dqtihpgeaxbceifhmmtz.supabase.co -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Create Savings Groups Table
CREATE TABLE IF NOT EXISTS public.savings_groups (
    id TEXT PRIMARY KEY DEFAULT 'group-default-1',
    name TEXT NOT NULL DEFAULT 'Our Savings Goal',
    partner1_name TEXT NOT NULL DEFAULT 'Prathamesh',
    partner2_name TEXT NOT NULL DEFAULT 'Mahek',
    partner1_avatar TEXT,
    partner2_avatar TEXT,
    goal_name TEXT NOT NULL DEFAULT 'iPhone 17 Pro Max',
    target_amount NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    target_date DATE DEFAULT '2027-01-01',
    daily_target_per_person NUMERIC(10, 2) DEFAULT 200.00,
    goal_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default Goal Group if missing
INSERT INTO public.savings_groups (id, name, partner1_name, partner2_name, goal_name, target_amount)
VALUES ('group-default-1', 'Our iPhone Fund', 'Prathamesh', 'Mahek', 'iPhone 17 Pro Max', 150000.00)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Savings Entries Table
CREATE TABLE IF NOT EXISTS public.savings_entries (
    id TEXT PRIMARY KEY,
    group_id TEXT DEFAULT 'group-default-1',
    user_id TEXT,
    partner_role TEXT NOT NULL CHECK (partner_role IN ('partner1', 'partner2')),
    user_name TEXT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) & Public Policies
ALTER TABLE public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_entries ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read/write for seamless multi-device sync
DROP POLICY IF EXISTS "Public read savings_groups" ON public.savings_groups;
CREATE POLICY "Public read savings_groups" ON public.savings_groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write savings_groups" ON public.savings_groups;
CREATE POLICY "Public write savings_groups" ON public.savings_groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read savings_entries" ON public.savings_entries;
CREATE POLICY "Public read savings_entries" ON public.savings_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public write savings_entries" ON public.savings_entries;
CREATE POLICY "Public write savings_entries" ON public.savings_entries FOR ALL USING (true);

-- 4. Enable Supabase Realtime for instant live updates across devices
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_groups;
