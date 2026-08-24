-- ==============================================================================
-- OUR iPHONE FUND DATABASE SCHEMA (PostgreSQL + Supabase RLS)
-- ==============================================================================

-- 1. Create Profiles Table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    partner_role TEXT CHECK (partner_role IN ('partner1', 'partner2')) DEFAULT 'partner1',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Savings Groups Table
CREATE TABLE IF NOT EXISTS public.savings_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL DEFAULT 'Our iPhone 17 Pro Max Savings',
    partner1_name TEXT NOT NULL DEFAULT 'Prathamesh',
    partner2_name TEXT NOT NULL DEFAULT 'Mahek',
    partner1_avatar TEXT,
    partner2_avatar TEXT,
    goal_name TEXT NOT NULL DEFAULT 'iPhone 17 Pro Max',
    target_amount NUMERIC(12, 2) NOT NULL DEFAULT 150000.00,
    target_date DATE NOT NULL DEFAULT '2027-01-01',
    daily_target_per_person NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    goal_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Group Members Junction Table
CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('partner1', 'partner2', 'member')) DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- 4. Create Savings Entries Table
CREATE TABLE IF NOT EXISTS public.savings_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    partner_role TEXT CHECK (partner_role IN ('partner1', 'partner2')) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce single contribution per partner per day
    UNIQUE(group_id, user_id, date)
);

-- 5. Create Milestones Table
CREATE TABLE IF NOT EXISTS public.milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.savings_groups(id) ON DELETE CASCADE,
    title TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    achieved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, amount)
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_entries_group_date ON public.savings_entries(group_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_entries_user_date ON public.savings_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_members_group_user ON public.group_members(group_id, user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can select all profiles in their savings group or own profile
CREATE POLICY "Public profiles are viewable by group members" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Savings Groups: Members of group can view & update group
CREATE POLICY "Group members can view savings group" ON public.savings_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_groups.id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Group members can update savings group" ON public.savings_groups
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_groups.id
            AND group_members.user_id = auth.uid()
        )
    );

-- Group Members: View members of own group
CREATE POLICY "View group members" ON public.group_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.group_members gm
            WHERE gm.group_id = group_members.group_id
            AND gm.user_id = auth.uid()
        )
    );

-- Savings Entries: View, Insert, Update, Delete for group members
CREATE POLICY "View entries for group members" ON public.savings_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_entries.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Insert entries for group members" ON public.savings_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_entries.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Update entries for own entries or group members" ON public.savings_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_entries.group_id
            AND group_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Delete entries for own entries or group members" ON public.savings_entries
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = savings_entries.group_id
            AND group_members.user_id = auth.uid()
        )
    );

-- Milestones: View & Update
CREATE POLICY "View group milestones" ON public.milestones
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.group_members
            WHERE group_members.group_id = milestones.group_id
            AND group_members.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON USER SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, partner_role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'Partner'),
    COALESCE(new.raw_user_meta_data->>'partner_role', 'partner1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for savings entries
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.savings_groups;
