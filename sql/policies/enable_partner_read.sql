-- This policy allows any user who is authenticated to read all rows from the public.partners table.
-- This is necessary for the app to be able to fetch and display partner locations on the map.

-- 1. Enable Row Level Security (RLS) on the 'partners' table if it's not already.
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- 2. Drop the policy if it already exists to ensure we start fresh.
DROP POLICY IF EXISTS "Allow authenticated users to read partners" ON public.partners;

-- 3. Create the new SELECT policy.
CREATE POLICY "Allow authenticated users to read partners"
ON public.partners
FOR SELECT
TO authenticated
USING (true);

-- After running this, your app should be able to fetch the partner data.
-- You can verify this by checking the 'partners' table in the Supabase table editor and ensuring RLS is enabled with this policy active. 