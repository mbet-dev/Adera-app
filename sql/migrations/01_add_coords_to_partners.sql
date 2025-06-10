-- Step 1: Add latitude and longitude columns to the partners table
-- This allows for storing precise coordinates for mapping.
-- We use the 'numeric' type for precision.

ALTER TABLE public.partners
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);

COMMENT ON COLUMN public.partners.latitude IS 'The geographic latitude of the partner location.';
COMMENT ON COLUMN public.partners.longitude IS 'The geographic longitude of the partner location.';

-- After running this, your 'partners' table will be ready to store coordinates. 