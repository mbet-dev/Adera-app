-- This policy allows any authenticated user to read all rows from the public.profiles table.
-- This is necessary for the app to be able to fetch partner names when displaying locations.

-- 1. Enable Row Level Security (RLS) on the 'profiles' table if it's not already.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop the policy if it already exists to ensure we start fresh.
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON public.profiles;

-- 3. Create the new SELECT policy.
CREATE POLICY "Allow authenticated users to read profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true); 