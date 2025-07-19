-- Adera App Complete Cleanup and Seed Script
-- Run this in your Supabase SQL Editor to delete ALL existing data and create fresh seed data
-- WARNING: This will permanently delete all data from all tables!

-- =====================================================
-- 1. DISABLE RLS TEMPORARILY FOR CLEANUP
-- =====================================================

-- Disable RLS on all tables to allow cleanup
ALTER TABLE public.parcels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DELETE DATA FROM PUBLIC TABLES (in correct order)
-- =====================================================

-- Delete from child tables first (due to foreign key constraints)
DELETE FROM public.parcels;
DELETE FROM public.shop_items;
DELETE FROM public.shop_categories;
DELETE FROM public.shops;
DELETE FROM public.partners;
DELETE FROM public.users;

-- =====================================================
-- 3. DELETE ALL USERS FROM AUTH TABLE
-- =====================================================

-- Delete all users from auth.users (this will cascade to related tables)
DELETE FROM auth.users;

-- =====================================================
-- 4. RESET SEQUENCES (if any)
-- =====================================================

-- Reset any sequences that might exist
DO $$
DECLARE
    seq_record RECORD;
BEGIN
    FOR seq_record IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_record.sequence_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- =====================================================
-- 5. RE-ENABLE RLS
-- =====================================================

-- Re-enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE FRESH SEED DATA
-- =====================================================

-- Create users in auth.users with proper metadata
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
SELECT 
  uuid_generate_v4(),
  user_data.email,
  crypt('MBet4321', gen_salt('bf')),
  NOW(),
  user_meta_data::jsonb,
  NOW(),
  NOW()
FROM (VALUES
  ('abel.tesfaye@gmail.com', '{"full_name":"Abel Tesfaye","role":"customer","phone_number":"+251911000001"}'),
  ('beza.worku@gmail.com', '{"full_name":"Beza Worku","role":"customer","phone_number":"+251911000002"}'),
  ('chala.demeke@gmail.com', '{"full_name":"Chala Demeke","role":"customer","phone_number":"+251911000003"}'),
  ('dawit.mengistu@gmail.com', '{"full_name":"Dawit Mengistu","role":"customer","phone_number":"+251911000004"}'),
  ('elias.abebe@gmail.com', '{"full_name":"Elias Abebe","role":"customer","phone_number":"+251911000005"}'),
  ('fikirte.getachew@gmail.com', '{"full_name":"Fikirte Getachew","role":"customer","phone_number":"+251911000006"}'),
  ('gelila.tesfaye@gmail.com', '{"full_name":"Gelila Tesfaye","role":"customer","phone_number":"+251911000007"}'),
  ('henok.sisay@gmail.com', '{"full_name":"Henok Sisay","role":"customer","phone_number":"+251911000008"}'),
  ('iris.zewdu@gmail.com', '{"full_name":"Iris Zewdu","role":"customer","phone_number":"+251911000009"}'),
  ('kaleab.desta@gmail.com', '{"full_name":"Kaleab Desta","role":"customer","phone_number":"+251911000010"}'),
  ('lelise.mengistu@gmail.com', '{"full_name":"Lelise Mengistu","role":"customer","phone_number":"+251911000011"}'),
  ('marta.kebede@gmail.com', '{"full_name":"Marta Kebede","role":"customer","phone_number":"+251911000012"}'),
  ('nardos.wolde@gmail.com', '{"full_name":"Nardos Wolde","role":"customer","phone_number":"+251911000013"}'),
  ('driver1@adera.et', '{"full_name":"Driver One","role":"driver","phone_number":"+251911100001"}'),
  ('driver2@adera.et', '{"full_name":"Driver Two","role":"driver","phone_number":"+251911100002"}'),
  ('driver3@adera.et', '{"full_name":"Driver Three","role":"driver","phone_number":"+251911100003"}'),
  ('driver4@adera.et', '{"full_name":"Driver Four","role":"driver","phone_number":"+251911100004"}'),
  ('driver5@adera.et', '{"full_name":"Driver Five","role":"driver","phone_number":"+251911100005"}'),
  ('staff1@adera.et', '{"full_name":"Staff One","role":"staff","phone_number":"+251911200001"}'),
  ('staff2@adera.et', '{"full_name":"Staff Two","role":"staff","phone_number":"+251911200002"}'),
  ('staff3@adera.et', '{"full_name":"Staff Three","role":"staff","phone_number":"+251911200003"}'),
  ('admin@adera.et', '{"full_name":"Admin User","role":"admin","phone_number":"+251911300001"}'),
  ('adama.k@partner.com', '{"full_name":"Adama Kifle","role":"partner","phone_number":"+251915000001"}'),
  ('blen.f@partner.com', '{"full_name":"Blen Fikadu","role":"partner","phone_number":"+251915000002"}'),
  ('chereka.g@partner.com', '{"full_name":"Chereka Gizaw","role":"partner","phone_number":"+251915000003"}'),
  ('daniel.b@partner.com', '{"full_name":"Daniel Bekele","role":"partner","phone_number":"+251915000004"}'),
  ('elias.a@partner.com', '{"full_name":"Elias Abebe","role":"partner","phone_number":"+251915000005"}'),
  ('fikirte.g@partner.com', '{"full_name":"Fikirte Getachew","role":"partner","phone_number":"+251915000006"}'),
  ('gelila.t@partner.com', '{"full_name":"Gelila Tesfaye","role":"partner","phone_number":"+251915000007"}'),
  ('henok.s@partner.com', '{"full_name":"Henok Sisay","role":"partner","phone_number":"+251915000008"}'),
  ('iris.z@partner.com', '{"full_name":"Iris Zewdu","role":"partner","phone_number":"+251915000009"}'),
  ('kaleab.d@partner.com', '{"full_name":"Kaleab Desta","role":"partner","phone_number":"+251915000010"}'),
  ('lelise.m@partner.com', '{"full_name":"Lelise Mengistu","role":"partner","phone_number":"+251915000011"}'),
  ('marta.k@partner.com', '{"full_name":"Marta Kebede","role":"partner","phone_number":"+251915000012"}'),
  ('nardos.w@partner.com', '{"full_name":"Nardos Wolde","role":"partner","phone_number":"+251915000013"}'),
  ('oliyad.t@partner.com', '{"full_name":"Oliyad Tesfaye","role":"partner","phone_number":"+251915000014"}'),
  ('peace.g@partner.com', '{"full_name":"Peace Genet","role":"partner","phone_number":"+251915000015"}'),
  ('qerensa.b@partner.com', '{"full_name":"Qerensa Belay","role":"partner","phone_number":"+251915000016"}'),
  ('redeat.a@partner.com', '{"full_name":"Redeat Abebe","role":"partner","phone_number":"+251915000017"}'),
  ('samrawit.b@partner.com', '{"full_name":"Samrawit Bekele","role":"partner","phone_number":"+251915000018"}'),
  ('tigist.a@partner.com', '{"full_name":"Tigist Alemayehu","role":"partner","phone_number":"+251915000019"}'),
  ('ujulu.k@partner.com', '{"full_name":"Ujulu Kebede","role":"partner","phone_number":"+251915000020"}'),
  ('wondwosen.t@partner.com', '{"full_name":"Wondwosen Tsegaye","role":"partner","phone_number":"+251915000021"}'),
  ('kidus.g@partner.com', '{"full_name":"Kidus Getachew","role":"partner","phone_number":"+251915000022"}'),
  ('yonas.l@partner.com', '{"full_name":"Yonas Legesse","role":"partner","phone_number":"+251915000023"}'),
  ('zerihun.a@partner.com', '{"full_name":"Zerihun Amare","role":"partner","phone_number":"+251915000024"}'),
  ('almaz.d@partner.com', '{"full_name":"Almaz Desta","role":"partner","phone_number":"+251915000025"}'),
  ('sortinghub.5kilo@adera.com', '{"full_name":"5 Kilo Sorting Hub","role":"partner","phone_number":"+251915000050"}'),
  ('sortinghub.kality@adera.com', '{"full_name":"Kality Sorting Hub","role":"partner","phone_number":"+251915000051"}')
) AS user_data(email, user_meta_data)
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users au WHERE au.email = user_data.email
);

-- Create user profiles in public.users table with sample images
INSERT INTO public.users (id, email, first_name, last_name, role, phone, profile_image_url, profile_images)
SELECT 
  au.id,
  au.email,
  SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
  SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 2) as last_name,
  (au.raw_user_meta_data->>'role')::user_role,
  au.raw_user_meta_data->>'phone_number',
  CASE 
    WHEN au.raw_user_meta_data->>'role' = 'customer' THEN 'https://example.com/profiles/customer_' || au.id || '_main.jpg'
    WHEN au.raw_user_meta_data->>'role' = 'partner' THEN 'https://example.com/profiles/partner_' || au.id || '_main.jpg'
    WHEN au.raw_user_meta_data->>'role' = 'driver' THEN 'https://example.com/profiles/driver_' || au.id || '_main.jpg'
    WHEN au.raw_user_meta_data->>'role' = 'admin' THEN 'https://example.com/profiles/admin_' || au.id || '_main.jpg'
    ELSE 'https://example.com/profiles/default_avatar.jpg'
  END,
  CASE 
    WHEN au.raw_user_meta_data->>'role' = 'customer' THEN ARRAY[
      'https://example.com/profiles/customer_' || au.id || '_1.jpg',
      'https://example.com/profiles/customer_' || au.id || '_2.jpg'
    ]
    WHEN au.raw_user_meta_data->>'role' = 'partner' THEN ARRAY[
      'https://example.com/profiles/partner_' || au.id || '_1.jpg',
      'https://example.com/profiles/partner_' || au.id || '_2.jpg',
      'https://example.com/profiles/partner_' || au.id || '_3.jpg'
    ]
    ELSE ARRAY['https://example.com/profiles/default_1.jpg']
  END
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Create partners with enhanced image support
INSERT INTO public.partners (user_id, business_name, business_category, address, latitude, longitude, phone, email, operating_hours, accepted_payment_methods, is_approved, is_active, business_logo_url, business_images, store_front_image, interior_images)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'adama.k@partner.com' THEN 'Adama Cafe & Bakery'
    WHEN u.email = 'blen.f@partner.com' THEN 'Blen Supermarket'
    WHEN u.email = 'chereka.g@partner.com' THEN 'Chereka Electronics'
    WHEN u.email = 'daniel.b@partner.com' THEN 'Daniel Restaurant'
    WHEN u.email = 'elias.a@partner.com' THEN 'Elias Pharmacy'
    WHEN u.email = 'fikirte.g@partner.com' THEN 'Fikirte Boutique'
    WHEN u.email = 'gelila.t@partner.com' THEN 'Gelila Books & Stationery'
    WHEN u.email = 'henok.s@partner.com' THEN 'Henok Autoparts'
    WHEN u.email = 'iris.z@partner.com' THEN 'Iris Spa & Wellness'
    WHEN u.email = 'kaleab.d@partner.com' THEN 'Kaleab Computer Repair'
    WHEN u.email = 'lelise.m@partner.com' THEN 'Lelise Grocery'
    WHEN u.email = 'marta.k@partner.com' THEN 'Marta Cafe'
    WHEN u.email = 'nardos.w@partner.com' THEN 'Nardos Giftshop'
    WHEN u.email = 'oliyad.t@partner.com' THEN 'Oliyad Hardware'
    WHEN u.email = 'peace.g@partner.com' THEN 'Peace Bakery'
    WHEN u.email = 'qerensa.b@partner.com' THEN 'Qerensa Art Gallery'
    WHEN u.email = 'redeat.a@partner.com' THEN 'Redeat Laundry Services'
    WHEN u.email = 'samrawit.b@partner.com' THEN 'Samrawit Butchery'
    WHEN u.email = 'tigist.a@partner.com' THEN 'Tigist Fashion Store'
    WHEN u.email = 'ujulu.k@partner.com' THEN 'Ujulu Organic Vegetables'
    WHEN u.email = 'wondwosen.t@partner.com' THEN 'Wondwosen Metal Works'
    WHEN u.email = 'kidus.g@partner.com' THEN 'Kidus Fitness Center'
    WHEN u.email = 'yonas.l@partner.com' THEN 'Yonas Printing Services'
    WHEN u.email = 'zerihun.a@partner.com' THEN 'Zerihun Tyre Shop'
    WHEN u.email = 'almaz.d@partner.com' THEN 'Almaz Designs'
    WHEN u.email = 'sortinghub.5kilo@adera.com' THEN '5 Kilo Sorting Facility Hub'
    WHEN u.email = 'sortinghub.kality@adera.com' THEN 'Kality Sorting Facility Hub'
    ELSE 'Partner Business'
  END,
  CASE 
    WHEN u.email LIKE '%cafe%' OR u.email LIKE '%bakery%' THEN 'Cafe'
    WHEN u.email LIKE '%supermarket%' OR u.email LIKE '%grocery%' THEN 'Supermarket'
    WHEN u.email LIKE '%electronics%' OR u.email LIKE '%computer%' THEN 'Electronics'
    WHEN u.email LIKE '%pharmacy%' THEN 'Pharmacy'
    WHEN u.email LIKE '%fashion%' OR u.email LIKE '%boutique%' THEN 'Fashion'
    WHEN u.email LIKE '%books%' THEN 'Books & Stationery'
    WHEN u.email LIKE '%autoparts%' OR u.email LIKE '%tyre%' THEN 'Automotive'
    WHEN u.email LIKE '%spa%' OR u.email LIKE '%fitness%' THEN 'Health & Beauty'
    WHEN u.email LIKE '%hardware%' OR u.email LIKE '%metal%' THEN 'Manufacturing'
    WHEN u.email LIKE '%laundry%' OR u.email LIKE '%printing%' THEN 'Services'
    WHEN u.email LIKE '%butchery%' THEN 'Food & Meat'
    WHEN u.email LIKE '%art%' OR u.email LIKE '%gift%' THEN 'Art & Decor'
    WHEN u.email LIKE '%sorting%' THEN 'Sorting Facility'
    ELSE 'General'
  END,
  CASE 
    WHEN u.email = 'adama.k@partner.com' THEN 'Bole Road, Addis Ababa'
    WHEN u.email = 'blen.f@partner.com' THEN 'Piaza, Addis Ababa'
    WHEN u.email = 'chereka.g@partner.com' THEN 'Merkato, Addis Ababa'
    WHEN u.email = 'daniel.b@partner.com' THEN 'Meskel Square, Addis Ababa'
    WHEN u.email = 'elias.a@partner.com' THEN 'Kazanchis, Addis Ababa'
    WHEN u.email = 'fikirte.g@partner.com' THEN 'Megenagna, Addis Ababa'
    WHEN u.email = 'gelila.t@partner.com' THEN 'Arat Kilo, Addis Ababa'
    WHEN u.email = 'henok.s@partner.com' THEN 'Sar Bet, Addis Ababa'
    WHEN u.email = 'iris.z@partner.com' THEN 'Bole Atlas, Addis Ababa'
    WHEN u.email = 'kaleab.d@partner.com' THEN 'Mexico Square, Addis Ababa'
    WHEN u.email = 'lelise.m@partner.com' THEN 'CMC, Addis Ababa'
    WHEN u.email = 'marta.k@partner.com' THEN 'Gerji, Addis Ababa'
    WHEN u.email = 'nardos.w@partner.com' THEN '22 Mazoria, Addis Ababa'
    WHEN u.email = 'oliyad.t@partner.com' THEN 'Akaki, Addis Ababa'
    WHEN u.email = 'peace.g@partner.com' THEN 'Summit, Addis Ababa'
    WHEN u.email = 'qerensa.b@partner.com' THEN 'Bole Rwanda, Addis Ababa'
    WHEN u.email = 'redeat.a@partner.com' THEN 'Sar Bet, Addis Ababa'
    WHEN u.email = 'samrawit.b@partner.com' THEN 'Kera, Addis Ababa'
    WHEN u.email = 'tigist.a@partner.com' THEN 'Lideta, Addis Ababa'
    WHEN u.email = 'ujulu.k@partner.com' THEN 'Shola, Addis Ababa'
    WHEN u.email = 'wondwosen.t@partner.com' THEN 'Gofa, Addis Ababa'
    WHEN u.email = 'kidus.g@partner.com' THEN 'Bole Medhanialem, Addis Ababa'
    WHEN u.email = 'yonas.l@partner.com' THEN 'Megenagna, Addis Ababa'
    WHEN u.email = 'zerihun.a@partner.com' THEN 'Gordem, Addis Ababa'
    WHEN u.email = 'almaz.d@partner.com' THEN 'Bole, Addis Ababa'
    WHEN u.email = 'sortinghub.5kilo@adera.com' THEN '5 Kilo, Addis Ababa'
    WHEN u.email = 'sortinghub.kality@adera.com' THEN 'Kality, Addis Ababa'
    ELSE 'Addis Ababa, Ethiopia'
  END,
  CASE 
    WHEN u.email = 'adama.k@partner.com' THEN 9.01000000
    WHEN u.email = 'blen.f@partner.com' THEN 9.02000000
    WHEN u.email = 'chereka.g@partner.com' THEN 9.00500000
    WHEN u.email = 'daniel.b@partner.com' THEN 8.99000000
    WHEN u.email = 'elias.a@partner.com' THEN 9.03000000
    WHEN u.email = 'fikirte.g@partner.com' THEN 9.01500000
    WHEN u.email = 'gelila.t@partner.com' THEN 9.00000000
    WHEN u.email = 'henok.s@partner.com' THEN 8.98000000
    WHEN u.email = 'iris.z@partner.com' THEN 9.02500000
    WHEN u.email = 'kaleab.d@partner.com' THEN 9.01000000
    WHEN u.email = 'lelise.m@partner.com' THEN 9.03500000
    WHEN u.email = 'marta.k@partner.com' THEN 9.04000000
    WHEN u.email = 'nardos.w@partner.com' THEN 9.00500000
    WHEN u.email = 'oliyad.t@partner.com' THEN 8.99500000
    WHEN u.email = 'peace.g@partner.com' THEN 9.01800000
    WHEN u.email = 'qerensa.b@partner.com' THEN 9.00000000
    WHEN u.email = 'redeat.a@partner.com' THEN 9.02200000
    WHEN u.email = 'samrawit.b@partner.com' THEN 8.98500000
    WHEN u.email = 'tigist.a@partner.com' THEN 9.03000000
    WHEN u.email = 'ujulu.k@partner.com' THEN 9.01500000
    WHEN u.email = 'wondwosen.t@partner.com' THEN 8.99000000
    WHEN u.email = 'kidus.g@partner.com' THEN 9.00800000
    WHEN u.email = 'yonas.l@partner.com' THEN 9.02000000
    WHEN u.email = 'zerihun.a@partner.com' THEN 9.00500000
    WHEN u.email = 'almaz.d@partner.com' THEN 9.00000000
    WHEN u.email = 'sortinghub.5kilo@adera.com' THEN 9.0476
    WHEN u.email = 'sortinghub.kality@adera.com' THEN 8.9900
    ELSE 9.00000000
  END,
  CASE 
    WHEN u.email = 'adama.k@partner.com' THEN 38.78000000
    WHEN u.email = 'blen.f@partner.com' THEN 38.77000000
    WHEN u.email = 'chereka.g@partner.com' THEN 38.76500000
    WHEN u.email = 'daniel.b@partner.com' THEN 38.78500000
    WHEN u.email = 'elias.a@partner.com' THEN 38.75000000
    WHEN u.email = 'fikirte.g@partner.com' THEN 38.79000000
    WHEN u.email = 'gelila.t@partner.com' THEN 38.77500000
    WHEN u.email = 'henok.s@partner.com' THEN 38.79500000
    WHEN u.email = 'iris.z@partner.com' THEN 38.78000000
    WHEN u.email = 'kaleab.d@partner.com' THEN 38.76000000
    WHEN u.email = 'lelise.m@partner.com' THEN 38.77000000
    WHEN u.email = 'marta.k@partner.com' THEN 38.76500000
    WHEN u.email = 'nardos.w@partner.com' THEN 38.79500000
    WHEN u.email = 'oliyad.t@partner.com' THEN 38.75500000
    WHEN u.email = 'peace.g@partner.com' THEN 38.78800000
    WHEN u.email = 'qerensa.b@partner.com' THEN 38.79000000
    WHEN u.email = 'redeat.a@partner.com' THEN 38.76700000
    WHEN u.email = 'samrawit.b@partner.com' THEN 38.77800000
    WHEN u.email = 'tigist.a@partner.com' THEN 38.78500000
    WHEN u.email = 'ujulu.k@partner.com' THEN 38.75000000
    WHEN u.email = 'wondwosen.t@partner.com' THEN 38.76000000
    WHEN u.email = 'kidus.g@partner.com' THEN 38.78200000
    WHEN u.email = 'yonas.l@partner.com' THEN 38.76000000
    WHEN u.email = 'zerihun.a@partner.com' THEN 38.74000000
    WHEN u.email = 'almaz.d@partner.com' THEN 38.77000000
    WHEN u.email = 'sortinghub.5kilo@adera.com' THEN 38.7612
    WHEN u.email = 'sortinghub.kality@adera.com' THEN 38.7500
    ELSE 38.75000000
  END,
  u.phone,
  u.email,
  '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "07:00", "close": "21:00"}, "sunday": {"open": "07:00", "close": "21:00"}}'::jsonb,
  ARRAY['cash_on_delivery', 'telebirr', 'wallet']::payment_method[],
  TRUE,
  TRUE,
  'https://example.com/logos/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_logo.png',
  ARRAY[
    'https://example.com/business/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_1.jpg',
    'https://example.com/business/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_2.jpg',
    'https://example.com/business/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_3.jpg'
  ],
  'https://example.com/storefronts/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_front.jpg',
  ARRAY[
    'https://example.com/interior/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_1.jpg',
    'https://example.com/interior/' || LOWER(REPLACE(u.first_name || '_' || u.last_name, ' ', '_')) || '_2.jpg'
  ]
FROM public.users u
WHERE u.role = 'partner'
AND NOT EXISTS (
  SELECT 1 FROM public.partners p WHERE p.user_id = u.id
);

-- Create shops for some partners with enhanced image support
INSERT INTO public.shops (partner_id, shop_name, description, template_type, primary_color, is_approved, banner_url, logo_url, shop_images)
SELECT 
  p.id,
  p.business_name || ' E-Shop',
  'Online shop for ' || p.business_name,
  'default',
  '#3B82F6',
  TRUE,
  'https://example.com/banners/' || LOWER(REPLACE(p.business_name, ' ', '_')) || '_banner.jpg',
  'https://example.com/shop_logos/' || LOWER(REPLACE(p.business_name, ' ', '_')) || '_logo.png',
  ARRAY[
    'https://example.com/shop_photos/' || LOWER(REPLACE(p.business_name, ' ', '_')) || '_1.jpg',
    'https://example.com/shop_photos/' || LOWER(REPLACE(p.business_name, ' ', '_')) || '_2.jpg',
    'https://example.com/shop_photos/' || LOWER(REPLACE(p.business_name, ' ', '_')) || '_3.jpg'
  ]
FROM public.partners p
WHERE p.business_name LIKE '%Cafe%' 
   OR p.business_name LIKE '%Supermarket%' 
   OR p.business_name LIKE '%Electronics%'
   OR p.business_name LIKE '%Fashion%'
AND NOT EXISTS (
  SELECT 1 FROM public.shops s WHERE s.partner_id = p.id
);

-- Create categories for shops
INSERT INTO public.shop_categories (shop_id, name, icon_url)
SELECT 
  s.id,
  'General Items',
  'https://example.com/icon.png'
FROM public.shops s
WHERE NOT EXISTS (
  SELECT 1 FROM public.shop_categories c WHERE c.shop_id = s.id
);

-- Create items for shops with enhanced image support
INSERT INTO public.shop_items (shop_id, category_id, name, description, price, quantity, main_image_url, image_urls, product_videos, delivery_supported)
SELECT 
  s.id,
  c.id,
  'Sample Item ' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id),
  'A test item for ' || s.shop_name,
  100.00 + (ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) * 50),
  10,
  'https://example.com/products/' || s.id || '_main_' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) || '.jpg',
  ARRAY[
    'https://example.com/products/' || s.id || '_1_' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) || '.jpg',
    'https://example.com/products/' || s.id || '_2_' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) || '.jpg',
    'https://example.com/products/' || s.id || '_3_' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) || '.jpg'
  ],
  ARRAY[
    'https://example.com/videos/' || s.id || '_demo_' || ROW_NUMBER() OVER (PARTITION BY s.id ORDER BY c.id) || '.mp4'
  ],
  TRUE
FROM public.shops s
JOIN public.shop_categories c ON s.id = c.shop_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.shop_items i WHERE i.shop_id = s.id
)
LIMIT 100;

-- Create sample parcels with enhanced image support
INSERT INTO public.parcels (tracking_id, sender_id, recipient_name, recipient_phone, package_type, delivery_fee, total_amount, payment_method, dropoff_partner_id, pickup_partner_id, status, package_images, damage_photos)
SELECT
  'ADE' || to_char(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9999)::TEXT, 4, '0'),
  au.id,
  'Recipient ' || ROW_NUMBER() OVER (ORDER BY au.id),
  '+251911' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0'),
  (ARRAY['document', 'small', 'medium', 'large'])[FLOOR(RANDOM() * 4) + 1]::package_type,
  50.00 + (FLOOR(RANDOM() * 100)),
  50.00 + (FLOOR(RANDOM() * 100)),
  (ARRAY['telebirr', 'cash_on_delivery', 'wallet'])[FLOOR(RANDOM() * 3) + 1]::payment_method,
  p1.id,
  p2.id,
  (ARRAY['created', 'dropoff', 'pickup_ready'])[FLOOR(RANDOM() * 3) + 1]::parcel_status,
  ARRAY[
    'https://example.com/parcels/' || au.id || '_package_1.jpg',
    'https://example.com/parcels/' || au.id || '_package_2.jpg',
    'https://example.com/parcels/' || au.id || '_package_3.jpg'
  ],
  ARRAY[
    'https://example.com/damage/' || au.id || '_damage_1.jpg',
    'https://example.com/damage/' || au.id || '_damage_2.jpg'
  ]
FROM auth.users au
JOIN public.users u ON au.id = u.id
CROSS JOIN (
  SELECT id FROM public.partners WHERE business_name LIKE '%Sorting%' LIMIT 1
) p1
CROSS JOIN (
  SELECT id FROM public.partners WHERE business_name NOT LIKE '%Sorting%' LIMIT 1
) p2
WHERE u.role = 'customer'
AND NOT EXISTS (
  SELECT 1 FROM public.parcels p WHERE p.sender_id = au.id
)
LIMIT 10;

-- Update user wallet balances (wallet_balance is already in users table)
UPDATE public.users 
SET wallet_balance = 1000.00 
WHERE role = 'customer' AND (wallet_balance = 0.00 OR wallet_balance IS NULL);

-- =====================================================
-- 7. VERIFICATION QUERY
-- =====================================================

-- Verify all data was created successfully
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'users created' as type
FROM auth.users
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'partners created' as type
FROM public.partners
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'shops created' as type
FROM public.shops
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'items created' as type
FROM public.shop_items
UNION ALL
SELECT 
  'Seed Data Summary' as message,
  COUNT(*) as total_users,
  'parcels created' as type
FROM public.parcels;

-- =====================================================
-- 8. SUCCESS MESSAGE
-- =====================================================

SELECT 'All data has been successfully cleaned and seeded. The app should now work correctly with the users table instead of profiles.' as status; 