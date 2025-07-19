-- Adera App Comprehensive Seed Data Script
-- Run this in your Supabase SQL Editor
-- This creates realistic Ethiopian data for testing all role-based scenarios
-- All passwords are 'MBet4321' - Supabase will hash them automatically

-- =====================================================
-- 1. CREATE USERS IN AUTH TABLE (Supabase handles password hashing automatically)
-- =====================================================

-- Insert users into auth.users with properly hashed passwords
-- Using bcrypt to hash the password 'MBet4321'
-- Only insert if user doesn't already exist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
SELECT 
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  email,
  crypt('MBet4321', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  user_meta_data::jsonb,
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
FROM (
  VALUES
-- CUSTOMERS (6 users)
('abel.tesfaye@gmail.com', '{"full_name":"Abel Tesfaye","role":"customer","phone_number":"+251911234567"}'),
('beza.haile@gmail.com', '{"full_name":"Beza Haile","role":"customer","phone_number":"+251922345678"}'),
('dawit.mengistu@gmail.com', '{"full_name":"Dawit Mengistu","role":"customer","phone_number":"+251933456789"}'),
('kidist.bogale@gmail.com', '{"full_name":"Kidist Bogale","role":"customer","phone_number":"+251944567890"}'),
('michael.tadesse@gmail.com', '{"full_name":"Michael Tadesse","role":"customer","phone_number":"+251955678901"}'),
('sara.alemu@gmail.com', '{"full_name":"Sara Alemu","role":"customer","phone_number":"+251966789012"}'),

-- DRIVERS (3 users)
('yohannes.dereje@gmail.com', '{"full_name":"Yohannes Dereje","role":"driver","phone_number":"+251977890123"}'),
('solomon.negussie@gmail.com', '{"full_name":"Solomon Negussie","role":"driver","phone_number":"+251988901234"}'),
('tadesse.worku@gmail.com', '{"full_name":"Tadesse Worku","role":"driver","phone_number":"+251999012345"}'),

-- STAFF (2 users)
('mulugeta.bekele@gmail.com', '{"full_name":"Mulugeta Bekele","role":"staff","phone_number":"+251900123456"}'),
('ayelech.teshome@gmail.com', '{"full_name":"Ayelech Teshome","role":"staff","phone_number":"+251901234567"}'),

-- ADMINS (2 users)
('admin@adera.et', '{"full_name":"Adera Admin","role":"admin","phone_number":"+251902345678"}'),
('manager@adera.et', '{"full_name":"Adera Manager","role":"admin","phone_number":"+251903456789"}'),

-- PARTNERS (25 users) - Each partner gets their own login
('bole.mini@adera.et', '{"full_name":"Bole Mini Market","role":"partner","phone_number":"+251911100001"}'),
('bole.pharmacy@adera.et', '{"full_name":"Bole Pharmacy","role":"partner","phone_number":"+251911100002"}'),
('bole.cafe@adera.et', '{"full_name":"Bole Internet Cafe","role":"partner","phone_number":"+251911100003"}'),
('kazanchis.shop@adera.et', '{"full_name":"Kazanchis Shop","role":"partner","phone_number":"+251911100004"}'),
('kazanchis.stationery@adera.et', '{"full_name":"Kazanchis Stationery","role":"partner","phone_number":"+251911100005"}'),
('piazza.books@adera.et', '{"full_name":"Piazza Bookstore","role":"partner","phone_number":"+251911100006"}'),
('piazza.electronics@adera.et', '{"full_name":"Piazza Electronics","role":"partner","phone_number":"+251911100007"}'),
('meskel.shop@adera.et', '{"full_name":"Meskel Square Shop","role":"partner","phone_number":"+251911100008"}'),
('meskel.pharmacy@adera.et', '{"full_name":"Meskel Pharmacy","role":"partner","phone_number":"+251911100009"}'),
('merkato.shop@adera.et', '{"full_name":"Merkato Market Shop","role":"partner","phone_number":"+251911100010"}'),
('merkato.electronics@adera.et', '{"full_name":"Merkato Electronics","role":"partner","phone_number":"+251911100011"}'),
('kolfe.mini@adera.et', '{"full_name":"Kolfe Mini Market","role":"partner","phone_number":"+251911100012"}'),
('kolfe.pharmacy@adera.et', '{"full_name":"Kolfe Pharmacy","role":"partner","phone_number":"+251911100013"}'),
('yeka.shop@adera.et', '{"full_name":"Yeka Shop","role":"partner","phone_number":"+251911100014"}'),
('yeka.cafe@adera.et', '{"full_name":"Yeka Internet Cafe","role":"partner","phone_number":"+251911100015"}'),
('arada.books@adera.et', '{"full_name":"Arada Bookstore","role":"partner","phone_number":"+251911100016"}'),
('arada.electronics@adera.et', '{"full_name":"Arada Electronics","role":"partner","phone_number":"+251911100017"}'),
('kirkos.mini@adera.et', '{"full_name":"Kirkos Mini Market","role":"partner","phone_number":"+251911100018"}'),
('kirkos.pharmacy@adera.et', '{"full_name":"Kirkos Pharmacy","role":"partner","phone_number":"+251911100019"}'),
('nifas.shop@adera.et', '{"full_name":"Nifas Silk Shop","role":"partner","phone_number":"+251911100020"}'),
('nifas.electronics@adera.et', '{"full_name":"Nifas Silk Electronics","role":"partner","phone_number":"+251911100021"}'),
('lideta.shop@adera.et', '{"full_name":"Lideta Market Shop","role":"partner","phone_number":"+251911100022"}'),
('lideta.cafe@adera.et', '{"full_name":"Lideta Internet Cafe","role":"partner","phone_number":"+251911100023"}'),
('addisketema.mini@adera.et', '{"full_name":"Addis Ketema Mini Market","role":"partner","phone_number":"+251911100024"}'),
('addisketema.pharmacy@adera.et', '{"full_name":"Addis Ketema Pharmacy","role":"partner","phone_number":"+251911100025"}')
) AS user_data(email, user_meta_data)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users au WHERE au.email = user_data.email
);

-- =====================================================
-- 2. CREATE PROFILES FOR ALL USERS
-- =====================================================

-- Create profiles for all users in the users table
INSERT INTO public.users (id, email, first_name, last_name, role, phone)
SELECT 
  au.id,
  au.email,
  SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
  SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 2) as last_name,
  (au.raw_user_meta_data->>'role')::user_role,
  au.raw_user_meta_data->>'phone_number'
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- =====================================================
-- 3. CREATE PARTNERS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_license TEXT,
  business_category TEXT,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  operating_hours JSONB,
  accepted_payment_methods payment_method[] DEFAULT ARRAY['cash_on_delivery']::payment_method[],
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partners' AND policyname = 'Partners can view own data'
  ) THEN
    CREATE POLICY "Partners can view own data" ON public.partners
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partners' AND policyname = 'Admins can view all partners'
  ) THEN
    CREATE POLICY "Admins can view all partners" ON public.partners
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'::user_role
        )
      );
  END IF;
END $$;

-- =====================================================
-- 4. SEED PARTNERS DATA (25 Pickup/Dropoff + 2 Sorting Facilities)
-- =====================================================

INSERT INTO public.partners (
  user_id, business_name, business_category, address, latitude, longitude, 
  phone, email, operating_hours, accepted_payment_methods, is_approved, is_active
) VALUES
-- SORTING FACILITIES (2) - No auth users needed, just partner records
(NULL, 'Adera Sorting Hub - Bole', 'sorting_facility', 'Bole, Addis Ababa, Ethiopia', 8.9806, 38.7578, '+251911000001', 'bole.hub@adera.et', '{"monday": {"open": "00:00", "close": "23:59"}, "tuesday": {"open": "00:00", "close": "23:59"}, "wednesday": {"open": "00:00", "close": "23:59"}, "thursday": {"open": "00:00", "close": "23:59"}, "friday": {"open": "00:00", "close": "23:59"}, "saturday": {"open": "00:00", "close": "23:59"}, "sunday": {"open": "00:00", "close": "23:59"}}'::jsonb, ARRAY['cash_on_delivery']::payment_method[], TRUE, TRUE),
(NULL, 'Adera Sorting Hub - Merkato', 'sorting_facility', 'Merkato, Addis Ababa, Ethiopia', 9.0272, 38.7369, '+251911000002', 'merkato.hub@adera.et', '{"monday": {"open": "00:00", "close": "23:59"}, "tuesday": {"open": "00:00", "close": "23:59"}, "wednesday": {"open": "00:00", "close": "23:59"}, "thursday": {"open": "00:00", "close": "23:59"}, "friday": {"open": "00:00", "close": "23:59"}, "saturday": {"open": "00:00", "close": "23:59"}, "sunday": {"open": "00:00", "close": "23:59"}}'::jsonb, ARRAY['cash_on_delivery']::payment_method[], TRUE, TRUE),

-- PICKUP/DROPOFF PARTNERS (25) - Each with their own auth user
((SELECT id FROM public.users WHERE email = 'bole.mini@adera.et'), 'Bole Mini Market', 'retail', 'Bole Atlas, Addis Ababa', 8.9856, 38.7598, '+251911100001', 'bole.mini@adera.et', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'bole.pharmacy@adera.et'), 'Bole Pharmacy', 'pharmacy', 'Bole Atlas, Addis Ababa', 8.9872, 38.7612, '+251911100002', 'bole.pharmacy@adera.et', '{"monday": {"open": "08:00", "close": "21:00"}, "tuesday": {"open": "08:00", "close": "21:00"}, "wednesday": {"open": "08:00", "close": "21:00"}, "thursday": {"open": "08:00", "close": "21:00"}, "friday": {"open": "08:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "21:00"}, "sunday": {"open": "08:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'bole.cafe@adera.et'), 'Bole Internet Cafe', 'cafe', 'Bole Atlas, Addis Ababa', 8.9845, 38.7589, '+251911100003', 'bole.cafe@adera.et', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),

-- Kazanchis Area
((SELECT id FROM public.users WHERE email = 'kazanchis.shop@adera.et'), 'Kazanchis Shop', 'retail', 'Kazanchis, Addis Ababa', 9.0123, 38.7456, '+251911100004', 'kazanchis.shop@adera.et', '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "22:00"}, "sunday": {"open": "06:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'kazanchis.stationery@adera.et'), 'Kazanchis Stationery', 'stationery', 'Kazanchis, Addis Ababa', 9.0145, 38.7478, '+251911100005', 'kazanchis.stationery@adera.et', '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),

-- Piazza Area
((SELECT id FROM public.users WHERE email = 'piazza.books@adera.et'), 'Piazza Bookstore', 'books', 'Piazza, Addis Ababa', 9.0345, 38.7567, '+251911100006', 'piazza.books@adera.et', '{"monday": {"open": "09:00", "close": "19:00"}, "tuesday": {"open": "09:00", "close": "19:00"}, "wednesday": {"open": "09:00", "close": "19:00"}, "thursday": {"open": "09:00", "close": "19:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "19:00"}, "sunday": {"open": "09:00", "close": "19:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'piazza.electronics@adera.et'), 'Piazza Electronics', 'electronics', 'Piazza, Addis Ababa', 9.0367, 38.7589, '+251911100007', 'piazza.electronics@adera.et', '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Meskel Square Area
((SELECT id FROM public.users WHERE email = 'meskel.shop@adera.et'), 'Meskel Square Shop', 'retail', 'Meskel Square, Addis Ababa', 9.0234, 38.7456, '+251911100008', 'meskel.shop@adera.et', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'meskel.pharmacy@adera.et'), 'Meskel Pharmacy', 'pharmacy', 'Meskel Square, Addis Ababa', 9.0256, 38.7478, '+251911100009', 'meskel.pharmacy@adera.et', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Merkato Area
((SELECT id FROM public.users WHERE email = 'merkato.shop@adera.et'), 'Merkato Market Shop', 'retail', 'Merkato, Addis Ababa', 9.0278, 38.7367, '+251911100010', 'merkato.shop@adera.et', '{"monday": {"open": "06:00", "close": "21:00"}, "tuesday": {"open": "06:00", "close": "21:00"}, "wednesday": {"open": "06:00", "close": "21:00"}, "thursday": {"open": "06:00", "close": "21:00"}, "friday": {"open": "06:00", "close": "21:00"}, "saturday": {"open": "06:00", "close": "21:00"}, "sunday": {"open": "06:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'merkato.electronics@adera.et'), 'Merkato Electronics', 'electronics', 'Merkato, Addis Ababa', 9.0290, 38.7389, '+251911100011', 'merkato.electronics@adera.et', '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Kolfe Area
((SELECT id FROM public.users WHERE email = 'kolfe.mini@adera.et'), 'Kolfe Mini Market', 'retail', 'Kolfe, Addis Ababa', 8.9876, 38.7234, '+251911100012', 'kolfe.mini@adera.et', '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "22:00"}, "sunday": {"open": "06:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'kolfe.pharmacy@adera.et'), 'Kolfe Pharmacy', 'pharmacy', 'Kolfe, Addis Ababa', 8.9898, 38.7256, '+251911100013', 'kolfe.pharmacy@adera.et', '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Yeka Area
((SELECT id FROM public.users WHERE email = 'yeka.shop@adera.et'), 'Yeka Shop', 'retail', 'Yeka, Addis Ababa', 9.0123, 38.7890, '+251911100014', 'yeka.shop@adera.et', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'yeka.cafe@adera.et'), 'Yeka Internet Cafe', 'cafe', 'Yeka, Addis Ababa', 9.0145, 38.7912, '+251911100015', 'yeka.cafe@adera.et', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),

-- Arada Area
((SELECT id FROM public.users WHERE email = 'arada.books@adera.et'), 'Arada Bookstore', 'books', 'Arada, Addis Ababa', 9.0234, 38.7567, '+251911100016', 'arada.books@adera.et', '{"monday": {"open": "09:00", "close": "19:00"}, "tuesday": {"open": "09:00", "close": "19:00"}, "wednesday": {"open": "09:00", "close": "19:00"}, "thursday": {"open": "09:00", "close": "19:00"}, "friday": {"open": "09:00", "close": "19:00"}, "saturday": {"open": "09:00", "close": "19:00"}, "sunday": {"open": "09:00", "close": "19:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'arada.electronics@adera.et'), 'Arada Electronics', 'electronics', 'Arada, Addis Ababa', 9.0256, 38.7589, '+251911100017', 'arada.electronics@adera.et', '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Kirkos Area
((SELECT id FROM public.users WHERE email = 'kirkos.mini@adera.et'), 'Kirkos Mini Market', 'retail', 'Kirkos, Addis Ababa', 9.0345, 38.7234, '+251911100018', 'kirkos.mini@adera.et', '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "22:00"}, "sunday": {"open": "06:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'kirkos.pharmacy@adera.et'), 'Kirkos Pharmacy', 'pharmacy', 'Kirkos, Addis Ababa', 9.0367, 38.7256, '+251911100019', 'kirkos.pharmacy@adera.et', '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Nifas Silk Area
((SELECT id FROM public.users WHERE email = 'nifas.shop@adera.et'), 'Nifas Silk Shop', 'retail', 'Nifas Silk, Addis Ababa', 8.9876, 38.7890, '+251911100020', 'nifas.shop@adera.et', '{"monday": {"open": "07:00", "close": "22:00"}, "tuesday": {"open": "07:00", "close": "22:00"}, "wednesday": {"open": "07:00", "close": "22:00"}, "thursday": {"open": "07:00", "close": "22:00"}, "friday": {"open": "07:00", "close": "22:00"}, "saturday": {"open": "07:00", "close": "22:00"}, "sunday": {"open": "07:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'nifas.electronics@adera.et'), 'Nifas Silk Electronics', 'electronics', 'Nifas Silk, Addis Ababa', 8.9898, 38.7912, '+251911100021', 'nifas.electronics@adera.et', '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "08:00", "close": "20:00"}, "sunday": {"open": "08:00", "close": "20:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),

-- Lideta Area
((SELECT id FROM public.users WHERE email = 'lideta.shop@adera.et'), 'Lideta Market Shop', 'retail', 'Lideta, Addis Ababa', 9.0123, 38.7567, '+251911100022', 'lideta.shop@adera.et', '{"monday": {"open": "06:00", "close": "21:00"}, "tuesday": {"open": "06:00", "close": "21:00"}, "wednesday": {"open": "06:00", "close": "21:00"}, "thursday": {"open": "06:00", "close": "21:00"}, "friday": {"open": "06:00", "close": "21:00"}, "saturday": {"open": "06:00", "close": "21:00"}, "sunday": {"open": "06:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'lideta.cafe@adera.et'), 'Lideta Internet Cafe', 'cafe', 'Lideta, Addis Ababa', 9.0145, 38.7589, '+251911100023', 'lideta.cafe@adera.et', '{"monday": {"open": "06:00", "close": "23:00"}, "tuesday": {"open": "06:00", "close": "23:00"}, "wednesday": {"open": "06:00", "close": "23:00"}, "thursday": {"open": "06:00", "close": "23:00"}, "friday": {"open": "06:00", "close": "23:00"}, "saturday": {"open": "06:00", "close": "23:00"}, "sunday": {"open": "06:00", "close": "23:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr']::payment_method[], TRUE, TRUE),

-- Addis Ketema Area
((SELECT id FROM public.users WHERE email = 'addisketema.mini@adera.et'), 'Addis Ketema Mini Market', 'retail', 'Addis Ketema, Addis Ababa', 9.0234, 38.7234, '+251911100024', 'addisketema.mini@adera.et', '{"monday": {"open": "06:00", "close": "22:00"}, "tuesday": {"open": "06:00", "close": "22:00"}, "wednesday": {"open": "06:00", "close": "22:00"}, "thursday": {"open": "06:00", "close": "22:00"}, "friday": {"open": "06:00", "close": "22:00"}, "saturday": {"open": "06:00", "close": "22:00"}, "sunday": {"open": "06:00", "close": "22:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE),
((SELECT id FROM public.users WHERE email = 'addisketema.pharmacy@adera.et'), 'Addis Ketema Pharmacy', 'pharmacy', 'Addis Ketema, Addis Ababa', 9.0256, 38.7256, '+251911100025', 'addisketema.pharmacy@adera.et', '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}'::jsonb, ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[], TRUE, TRUE);

-- =====================================================
-- 5. CREATE E-COMMERCE TABLES (if not exists)
-- =====================================================

-- Shops table
CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  shop_name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  logo_url TEXT,
  template_type TEXT DEFAULT 'default',
  primary_color TEXT DEFAULT '#3B82F6',
  approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES public.shops(id),
  name TEXT NOT NULL,
  icon_url TEXT
);

-- Items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id UUID REFERENCES public.shops(id),
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2),
  quantity INTEGER,
  image_urls TEXT[],
  delivery_supported BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for e-commerce tables
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. SEED E-COMMERCE DATA
-- =====================================================

-- Create shops for some partners
INSERT INTO public.shops (partner_id, shop_name, description, template_type, primary_color)
SELECT 
  p.id,
  p.business_name || ' Online Store',
  'Online store for ' || p.business_name,
  'default',
  '#3B82F6'
FROM public.partners p
WHERE p.business_category != 'sorting_facility'
LIMIT 5;

-- Create categories
INSERT INTO public.categories (shop_id, name)
SELECT 
  s.id,
  unnest(ARRAY['Electronics', 'Clothing', 'Books', 'Groceries', 'Pharmacy'])
FROM public.shops s;

-- Create items
INSERT INTO public.items (shop_id, category_id, name, description, price, quantity, image_urls)
SELECT 
  s.id,
  c.id,
  CASE 
    WHEN c.name = 'Electronics' THEN 'Smartphone'
    WHEN c.name = 'Clothing' THEN 'Traditional Dress'
    WHEN c.name = 'Books' THEN 'Amharic Novel'
    WHEN c.name = 'Groceries' THEN 'Coffee Beans'
    WHEN c.name = 'Pharmacy' THEN 'Pain Relief Medicine'
  END,
  CASE 
    WHEN c.name = 'Electronics' THEN 'Latest smartphone with great features'
    WHEN c.name = 'Clothing' THEN 'Beautiful traditional Ethiopian dress'
    WHEN c.name = 'Books' THEN 'Popular Amharic novel'
    WHEN c.name = 'Groceries' THEN 'Premium Ethiopian coffee beans'
    WHEN c.name = 'Pharmacy' THEN 'Effective pain relief medicine'
  END,
  CASE 
    WHEN c.name = 'Electronics' THEN 15000.00
    WHEN c.name = 'Clothing' THEN 2500.00
    WHEN c.name = 'Books' THEN 350.00
    WHEN c.name = 'Groceries' THEN 450.00
    WHEN c.name = 'Pharmacy' THEN 120.00
  END,
  CASE 
    WHEN c.name = 'Electronics' THEN 10
    WHEN c.name = 'Clothing' THEN 25
    WHEN c.name = 'Books' THEN 50
    WHEN c.name = 'Groceries' THEN 100
    WHEN c.name = 'Pharmacy' THEN 75
  END,
  ARRAY['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
FROM public.shops s
JOIN public.categories c ON s.id = c.shop_id;

-- =====================================================
-- 7. CREATE PARCELS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_id TEXT UNIQUE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_email TEXT,
  package_type package_type NOT NULL,
  package_weight DECIMAL(8,2),
  package_dimensions JSONB,
  package_description TEXT,
  package_images TEXT[],
  pickup_code TEXT,
  delivery_fee DECIMAL(8,2) NOT NULL,
  insurance_fee DECIMAL(8,2) DEFAULT 0.00,
  total_amount DECIMAL(8,2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  status parcel_status DEFAULT 'created',
  dropoff_partner_id UUID REFERENCES public.partners(id),
  pickup_partner_id UUID REFERENCES public.partners(id),
  assigned_driver_id UUID REFERENCES public.drivers(id),
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for parcels
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for parcels
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'parcels' AND policyname = 'Users can view own parcels'
  ) THEN
    CREATE POLICY "Users can view own parcels" ON public.parcels
      FOR SELECT USING (auth.uid() = sender_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'parcels' AND policyname = 'Partners can view assigned parcels'
  ) THEN
    CREATE POLICY "Partners can view assigned parcels" ON public.parcels
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.partners p 
          WHERE p.user_id = auth.uid() 
          AND (p.id = dropoff_partner_id OR p.id = pickup_partner_id)
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'parcels' AND policyname = 'Admins can view all parcels'
  ) THEN
    CREATE POLICY "Admins can view all parcels" ON public.parcels
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'::user_role
        )
      );
  END IF;
END $$;

-- =====================================================
-- 8. CREATE WALLETS TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wallets' AND policyname = 'Users can view own wallet'
  ) THEN
    CREATE POLICY "Users can view own wallet" ON public.wallets
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'wallets' AND policyname = 'Users can update own wallet'
  ) THEN
    CREATE POLICY "Users can update own wallet" ON public.wallets
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- 9. SEED WALLET DATA FOR CUSTOMERS
-- =====================================================

INSERT INTO public.wallets (user_id, balance)
SELECT 
  au.id,
  (RANDOM() * 1000 + 100)::DECIMAL(10,2)
FROM auth.users au
JOIN public.users u ON au.id = u.id
WHERE u.role = 'customer'::user_role
AND NOT EXISTS (
  SELECT 1 FROM public.wallets w WHERE w.user_id = au.id
);

-- =====================================================
-- 10. SEED SAMPLE PARCELS
-- =====================================================

INSERT INTO public.parcels (
  tracking_id, sender_id, recipient_name, recipient_phone, 
  package_type, package_description, delivery_fee, total_amount, payment_method, payment_status, status
)
SELECT 
  'ADE' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0'),
  au.id,
  'Test Recipient ' || ROW_NUMBER() OVER (),
  '+2519' || LPAD(FLOOR(RANDOM() * 99999999)::TEXT, 8, '0'),
  CASE (ROW_NUMBER() OVER () % 4)
    WHEN 0 THEN 'document'::package_type
    WHEN 1 THEN 'small'::package_type
    WHEN 2 THEN 'medium'::package_type
    ELSE 'large'::package_type
  END,
  'Test package for delivery',
  (RANDOM() * 200 + 50)::DECIMAL(8,2),
  (RANDOM() * 500 + 100)::DECIMAL(8,2),
  CASE (ROW_NUMBER() OVER () % 4)
    WHEN 0 THEN 'wallet'::payment_method
    WHEN 1 THEN 'telebirr'::payment_method
    WHEN 2 THEN 'cash_on_delivery'::payment_method
    ELSE 'recipient_pays'::payment_method
  END,
  CASE (ROW_NUMBER() OVER () % 3)
    WHEN 0 THEN 'pending'::payment_status
    WHEN 1 THEN 'completed'::payment_status
    ELSE 'failed'::payment_status
  END,
  CASE (ROW_NUMBER() OVER () % 7)
    WHEN 0 THEN 'created'::parcel_status
    WHEN 1 THEN 'dropoff'::parcel_status
    WHEN 2 THEN 'in_transit_to_facility_hub'::parcel_status
    WHEN 3 THEN 'facility_received'::parcel_status
    WHEN 4 THEN 'in_transit_to_pickup_point'::parcel_status
    WHEN 5 THEN 'pickup_ready'::parcel_status
    ELSE 'delivered'::parcel_status
  END
FROM auth.users au
WHERE au.raw_user_meta_data->>'role' = 'customer'
AND NOT EXISTS (
  SELECT 1 FROM public.parcels p WHERE p.sender_id = au.id
)
LIMIT 10;

-- =====================================================
-- 11. FINAL SUMMARY
-- =====================================================

SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'users created' as type
FROM auth.users
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_partners,
  'partners created' as type
FROM public.partners
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_shops,
  'shops created' as type
FROM public.shops
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_items,
  'items created' as type
FROM public.items
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_parcels,
  'parcels created' as type
FROM public.parcels; 