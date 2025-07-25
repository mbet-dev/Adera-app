-- =====================================================
-- FIX CATEGORIES RLS: Add public read access to shop_categories
-- This script adds the necessary RLS policy to allow
-- public read access to shop_categories table
-- =====================================================

-- =====================================================
-- 1. ADD RLS POLICY FOR SHOP_CATEGORIES
-- =====================================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to shop_categories" ON public.shop_categories;

-- Create new policy for public read access
CREATE POLICY "Allow public read access to shop_categories" 
ON public.shop_categories 
FOR SELECT 
USING (true);

-- =====================================================
-- 2. VERIFICATION
-- =====================================================

-- Check if the policy was created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'shop_categories' 
  AND schemaname = 'public';

-- =====================================================
-- 3. TEST QUERY
-- =====================================================

-- Test that we can now read from shop_categories
SELECT 
  COUNT(*) as category_count,
  'Categories are now accessible' as status
FROM public.shop_categories;

-- =====================================================
-- 4. SUMMARY
-- =====================================================

SELECT 
  'RLS Policy Added' as message,
  'shop_categories now has public read access' as details,
  'Categories should now load in the app' as status; 