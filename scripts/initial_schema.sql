-- Create exec_sql function
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'driver', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create parcels table
CREATE TABLE IF NOT EXISTS parcels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tracking_number TEXT UNIQUE NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled')) NOT NULL,
  driver_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create parcel_tracking table
CREATE TABLE IF NOT EXISTS parcel_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'picked_up', 'in_transit', 'delivered', 'cancelled')) NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcel_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Customers can view their own parcels" ON parcels;
DROP POLICY IF EXISTS "Customers can create parcels" ON parcels;
DROP POLICY IF EXISTS "Drivers can update parcel status" ON parcels;
DROP POLICY IF EXISTS "Anyone can view parcel tracking" ON parcel_tracking;
DROP POLICY IF EXISTS "Drivers can create tracking updates" ON parcel_tracking;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Customers can view their own parcels"
  ON parcels FOR SELECT
  USING (sender_id = auth.uid() OR driver_id = auth.uid());

CREATE POLICY "Customers can create parcels"
  ON parcels FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Drivers can update parcel status"
  ON parcels FOR UPDATE
  USING (driver_id = auth.uid());

CREATE POLICY "Anyone can view parcel tracking"
  ON parcel_tracking FOR SELECT
  USING (true);

CREATE POLICY "Drivers can create tracking updates"
  ON parcel_tracking FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM parcels
    WHERE parcels.id = parcel_tracking.parcel_id
    AND parcels.driver_id = auth.uid()
  ));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'role'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 