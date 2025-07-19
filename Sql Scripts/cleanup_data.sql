-- Adera App Complete Data Cleanup Script
-- Run this in your Supabase SQL Editor to delete ALL existing data
-- WARNING: This will permanently delete all data from all tables!

-- =====================================================
-- 1. DISABLE RLS TEMPORARILY FOR CLEANUP
-- =====================================================

-- Disable RLS on all tables to allow cleanup
ALTER TABLE public.wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. DELETE DATA FROM PUBLIC TABLES (in correct order)
-- =====================================================

-- Delete from child tables first (due to foreign key constraints)
DELETE FROM public.wallets;
DELETE FROM public.parcels;
DELETE FROM public.items;
DELETE FROM public.categories;
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
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. VERIFICATION QUERY
-- =====================================================

-- Verify all tables are empty
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'auth.users' as table_name
FROM auth.users
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.users' as table_name
FROM public.users
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.partners' as table_name
FROM public.partners
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.shops' as table_name
FROM public.shops
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.items' as table_name
FROM public.items
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.parcels' as table_name
FROM public.parcels
UNION ALL
SELECT 
  'Cleanup Verification' as message,
  COUNT(*) as count,
  'public.wallets' as table_name
FROM public.wallets;

-- =====================================================
-- 7. SUCCESS MESSAGE
-- =====================================================

SELECT 'All data has been successfully deleted. You can now run the seed_data.sql script for a fresh start.' as status; 