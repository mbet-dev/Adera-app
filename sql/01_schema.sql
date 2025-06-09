-- Filename: sql/01_schema.sql
-- Description: This script defines the complete database schema for the Adera application.
-- It includes tables for users, roles, parcels, tracking, and other core entities.

-- Note: This schema is for Supabase project homruajaunrqwdsmarnq.

-- ----------------------------------------------------------------
-- Step 1.5: Drop Existing Tables
-- To make the script idempotent, we drop tables in reverse order of dependency.
-- ----------------------------------------------------------------
DROP TABLE IF EXISTS public.messages;
DROP TABLE IF EXISTS public.transactions;
DROP TABLE IF EXISTS public.parcel_tracking;
DROP TABLE IF EXISTS public.parcels;
DROP TABLE IF EXISTS public.drivers;
DROP TABLE IF EXISTS public.couriers;
DROP TABLE IF EXISTS public.partners;
DROP TABLE IF EXISTS public.profiles;

-- ----------------------------------------------------------------
-- Step 2: Create Tables
-- ----------------------------------------------------------------

-- Profiles Table
-- Stores public-facing user information. Linked one-to-one with auth.users.
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone_number TEXT UNIQUE, -- Made unique as it can be used for login
  role        TEXT NOT NULL CHECK (role IN ('customer', 'partner', 'driver', 'staff', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Stores public information for each user, linked to their authentication record.';
COMMENT ON COLUMN public.profiles.id IS 'Links to the auth.users table.';
COMMENT ON COLUMN public.profiles.role IS 'Defines the user''s role within the application.';

-- Partners Table
-- Stores additional information specific to users with the 'partner' role.
CREATE TABLE public.partners (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  location        TEXT, -- Could be a GeoJSON or PostGIS point in the future
  location_pic_url TEXT,
  working_hours   TEXT,
  is_facility     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.partners IS 'Additional details for users who are partners (pickup/dropoff points).';
COMMENT ON COLUMN public.partners.is_facility IS 'Identifies if a partner location is a central sorting facility.';

-- Drivers Table
-- Stores additional information specific to users with the 'driver' role.
CREATE TABLE public.drivers (
  id                UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  vehicle_details   TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.drivers IS 'Additional details for users who are drivers.';

-- Parcels Table
-- The core table for managing all parcel deliveries.
CREATE TABLE public.parcels (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id               UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id             UUID REFERENCES public.profiles(id), -- Can be null initially
  pickup_partner_id       UUID REFERENCES public.partners(id),
  delivery_partner_id     UUID REFERENCES public.partners(id),
  assigned_driver_id      UUID REFERENCES public.drivers(id),
  
  -- Receiver info can be stored directly if they are not a platform user yet
  receiver_name_unregistered TEXT,
  receiver_phone_unregistered TEXT,

  status                  TEXT NOT NULL CHECK (status IN ('created', 'at_dropoff', 'in_transit_to_facility', 'at_facility', 'in_transit_to_pickup', 'ready_for_pickup', 'delivered', 'cancelled')),
  pickup_address          TEXT NOT NULL,
  delivery_address        TEXT NOT NULL,
  pickup_instructions     TEXT,
  delivery_instructions   TEXT,
  
  -- Codes for tracking and verification
  tracking_code           TEXT UNIQUE NOT NULL,
  pickup_code             TEXT UNIQUE NOT NULL,
  delivery_code           TEXT UNIQUE NOT NULL,

  -- Parcel details
  size                    TEXT CHECK (size IN ('document', 'small', 'medium', 'large')),
  photos_urls             TEXT[], -- Array of URLs to stored photos

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.parcels IS 'Central table for all parcel information and its lifecycle.';
COMMENT ON COLUMN public.parcels.status IS 'The current stage of the parcel in the delivery process.';
COMMENT ON COLUMN public.parcels.tracking_code IS 'Public code for customers to track their parcel.';
COMMENT ON COLUMN public.parcels.pickup_code IS 'Code used by sender/partner for verification at dropoff.';
COMMENT ON COLUMN public.parcels.delivery_code IS 'Code used by receiver for verification at pickup.';

-- Parcel Tracking History Table
-- Logs every significant event in a parcel's journey.
CREATE TABLE public.parcel_tracking (
  id          BIGSERIAL PRIMARY KEY,
  parcel_id   UUID NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  status      TEXT NOT NULL, -- Mirrors a value from the parcel_status type
  location    TEXT,          -- Optional location snapshot for the event
  notes       TEXT,
  actor_id    UUID REFERENCES public.profiles(id), -- User who triggered the event
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.parcel_tracking IS 'A log of all status changes and events for each parcel.';
COMMENT ON COLUMN public.parcel_tracking.actor_id IS 'The user (driver, partner, staff) who performed the action.';

-- Transactions Table
-- Manages payments for each parcel delivery.
CREATE TABLE public.transactions (
    id              BIGSERIAL PRIMARY KEY,
    parcel_id       UUID NOT NULL REFERENCES public.parcels(id),
    payer_id        UUID NOT NULL REFERENCES public.profiles(id),
    amount          DECIMAL(10, 2) NOT NULL,
    payment_method  TEXT NOT NULL CHECK (payment_method IN ('cash_on_delivery', 'telebirr', 'chapa', 'arifpay', 'wallet')),
    status          TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    provider_txn_id TEXT, -- Transaction ID from the payment provider
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Records all financial transactions related to parcel deliveries.';

-- In-App Chat Messages Table
CREATE TABLE public.messages (
    id          BIGSERIAL PRIMARY KEY,
    parcel_id   UUID REFERENCES public.parcels(id), -- Optional: can be a general support chat
    sender_id   UUID NOT NULL REFERENCES public.profiles(id),
    receiver_id UUID NOT NULL REFERENCES public.profiles(id),
    content     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.messages IS 'Stores messages for the in-app chat system.';

-- ----------------------------------------------------------------
-- Step 3: Create Functions and Triggers
-- ----------------------------------------------------------------

-- Trigger to automatically update the 'updated_at' timestamp on table modifications
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to tables with an 'updated_at' column
DROP TRIGGER IF EXISTS on_profiles_update ON public.profiles;
CREATE TRIGGER on_profiles_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_partners_update ON public.partners;
CREATE TRIGGER on_partners_update
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_drivers_update ON public.drivers;
CREATE TRIGGER on_drivers_update
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  
DROP TRIGGER IF EXISTS on_parcels_update ON public.parcels;
CREATE TRIGGER on_parcels_update
  BEFORE UPDATE ON public.parcels
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS on_transactions_update ON public.transactions;
CREATE TRIGGER on_transactions_update
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function after a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ----------------------------------------------------------------
-- Step 4: Set up Row-Level Security (RLS) Policies
-- ----------------------------------------------------------------
-- Enable RLS for all relevant tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcel_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- PROFILES POLICIES
--
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

--
-- PARCELS POLICIES
--
DROP POLICY IF EXISTS "Users can view parcels they sent or are receiving" ON public.parcels;
CREATE POLICY "Users can view parcels they sent or are receiving"
  ON public.parcels FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Customers can create new parcels" ON public.parcels;
CREATE POLICY "Customers can create new parcels"
  ON public.parcels FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'customer');

DROP POLICY IF EXISTS "Drivers can view parcels assigned to them" ON public.parcels;
CREATE POLICY "Drivers can view parcels assigned to them"
  ON public.parcels FOR SELECT
  USING (auth.uid() = assigned_driver_id);
  
DROP POLICY IF EXISTS "Admins can access all parcels" ON public.parcels;
CREATE POLICY "Admins can access all parcels"
  ON public.parcels FOR ALL
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Add more policies for other tables and roles as needed.
-- This is a starting point.

-- ----------------------------------------------------------------
-- Step 5: Create Indexes for Performance
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_parcels_sender_id ON public.parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_receiver_id ON public.parcels(receiver_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcel_tracking_parcel_id ON public.parcel_tracking(parcel_id);
CREATE INDEX IF NOT EXISTS idx_transactions_parcel_id ON public.transactions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_messages_parcel_id ON public.messages(parcel_id);


-- --- END OF SCHEMA --- 