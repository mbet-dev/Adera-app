-- =====================================================
-- ADERA GUEST ACCESS AND AUTHENTICATION ENHANCEMENTS
-- =====================================================
-- This script ensures database policies support guest browsing
-- and proper authentication flows for the enhanced app experience
-- Run this script to update policies for guest access features

-- =====================================================
-- 1. ENSURE SHOP_ITEMS CAN BE READ BY GUEST USERS
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to shop items
DROP POLICY IF EXISTS "Allow guest access to active shop items" ON shop_items;
CREATE POLICY "Allow guest access to active shop items" ON shop_items
    FOR SELECT USING (is_active = true);

-- =====================================================
-- 2. ENSURE SHOPS CAN BE READ BY GUEST USERS
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to active shops
DROP POLICY IF EXISTS "Allow guest access to active shops" ON shops;
CREATE POLICY "Allow guest access to active shops" ON shops
    FOR SELECT USING (is_active = true AND is_approved = true);

-- =====================================================
-- 3. ENSURE SHOP_CATEGORIES CAN BE READ BY GUEST USERS
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE shop_categories ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to shop categories
DROP POLICY IF EXISTS "Allow guest access to shop categories" ON shop_categories;
CREATE POLICY "Allow guest access to shop categories" ON shop_categories
    FOR SELECT USING (true);

-- =====================================================
-- 4. ENSURE PARTNERS CAN BE READ BY GUEST USERS (for shop info)
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to active partners
DROP POLICY IF EXISTS "Allow guest access to active partners" ON partners;
CREATE POLICY "Allow guest access to active partners" ON partners
    FOR SELECT USING (is_active = true AND is_approved = true);

-- =====================================================
-- 5. CART ITEMS RESTRICTIONS (authenticated users only)
-- =====================================================

-- Ensure cart_items require authentication
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for cart items (authenticated users only)
DROP POLICY IF EXISTS "Users can manage their own cart items" ON cart_items;
CREATE POLICY "Users can manage their own cart items" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 6. WALLET AND TRANSACTIONS (authenticated users only)
-- =====================================================

-- Ensure wallets are only accessible by authenticated users
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for wallets
DROP POLICY IF EXISTS "Users can access their own wallet" ON wallets;
CREATE POLICY "Users can access their own wallet" ON wallets
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 7. ENSURE PRODUCT REVIEWS CAN BE READ BY GUESTS
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to product reviews
DROP POLICY IF EXISTS "Allow guest access to product reviews" ON product_reviews;
CREATE POLICY "Allow guest access to product reviews" ON product_reviews
    FOR SELECT USING (true);

-- Create policy for authenticated users to manage their own reviews
DROP POLICY IF EXISTS "Users can manage their own product reviews" ON product_reviews;
CREATE POLICY "Users can manage their own product reviews" ON product_reviews
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 8. ENSURE SHOP REVIEWS CAN BE READ BY GUESTS
-- =====================================================

-- Enable row level security if not already enabled
ALTER TABLE shop_reviews ENABLE ROW LEVEL SECURITY;

-- Create or replace policy for guest access to shop reviews
DROP POLICY IF EXISTS "Allow guest access to shop reviews" ON shop_reviews;
CREATE POLICY "Allow guest access to shop reviews" ON shop_reviews
    FOR SELECT USING (true);

-- Create policy for authenticated users to manage their own reviews
DROP POLICY IF EXISTS "Users can manage their own shop reviews" ON shop_reviews;
CREATE POLICY "Users can manage their own shop reviews" ON shop_reviews
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- 9. CREATE GUEST SESSION SUPPORT (if needed)
-- =====================================================

-- Create a function to check if a user is authenticated or guest
CREATE OR REPLACE FUNCTION is_authenticated_or_guest()
RETURNS boolean AS $$
BEGIN
    -- Allow access for authenticated users or return true for guest access
    RETURN auth.uid() IS NOT NULL OR true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. UPDATE USERS TABLE POLICIES
-- =====================================================

-- Ensure users table has proper RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
CREATE POLICY "Users can read their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Verify that guest access policies are working
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('shop_items', 'shops', 'shop_categories', 'partners', 'product_reviews', 'shop_reviews')
ORDER BY tablename, policyname;

-- =====================================================
-- 12. SUMMARY REPORT
-- =====================================================

SELECT 
    'Guest Access Enhancement Complete' as status,
    'Database policies now support guest browsing of shops, products, and reviews while protecting user-specific data' as message,
    now() as completed_at;
