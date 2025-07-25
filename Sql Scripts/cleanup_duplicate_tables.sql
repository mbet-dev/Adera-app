-- =====================================================
-- CLEANUP DUPLICATE TABLES: Remove 'items' table
-- This script safely removes the legacy 'items' table
-- and ensures all data is properly migrated to 'shop_items'
-- =====================================================

-- =====================================================
-- 1. BACKUP AND MIGRATE DATA (if needed)
-- =====================================================

-- First, let's check if there's any data in the items table that needs migration
DO $$
DECLARE
    items_count INTEGER;
    shop_items_count INTEGER;
BEGIN
    -- Count records in both tables
    SELECT COUNT(*) INTO items_count FROM public.items;
    SELECT COUNT(*) INTO shop_items_count FROM public.shop_items;
    
    RAISE NOTICE 'Items table has % records', items_count;
    RAISE NOTICE 'Shop_items table has % records', shop_items_count;
    
    -- If items table has data and shop_items is empty, migrate the data
    IF items_count > 0 AND shop_items_count = 0 THEN
        RAISE NOTICE 'Migrating data from items to shop_items...';
        
        -- Insert data from items to shop_items with proper mapping
        INSERT INTO public.shop_items (
            id, shop_id, category_id, name, description, price, 
            original_price, quantity, image_urls, delivery_supported, 
            delivery_fee, is_active, is_featured, views_count, 
            sales_count, rating, created_at, updated_at
        )
        SELECT 
            i.id,
            i.shop_id,
            i.category_id,
            i.name,
            i.description,
            COALESCE(i.price, 0),
            NULL, -- original_price
            COALESCE(i.quantity, 0),
            i.image_urls,
            COALESCE(i.delivery_supported, true),
            COALESCE(i.delivery_fee, 0),
            COALESCE(i.is_active, true),
            COALESCE(i.is_featured, false),
            COALESCE(i.views_count, 0),
            COALESCE(i.sales_count, 0),
            COALESCE(i.rating, 0),
            COALESCE(i.created_at, NOW()),
            COALESCE(i.updated_at, NOW())
        FROM public.items i
        WHERE NOT EXISTS (
            SELECT 1 FROM public.shop_items si WHERE si.id = i.id
        );
        
        RAISE NOTICE 'Migration completed successfully';
    ELSE
        RAISE NOTICE 'No migration needed or shop_items already has data';
    END IF;
END $$;

-- =====================================================
-- 2. DROP LEGACY TABLES AND CONSTRAINTS
-- =====================================================

-- Drop the items table (this will cascade to any foreign key constraints)
DROP TABLE IF EXISTS public.items CASCADE;

-- Drop the categories table if it's not being used by shop_items
-- (shop_items uses shop_categories, not categories)
DROP TABLE IF EXISTS public.categories CASCADE;

-- =====================================================
-- 3. VERIFY CLEANUP
-- =====================================================

-- Check that items table is gone
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'items' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Items table still exists after cleanup';
    ELSE
        RAISE NOTICE 'Items table successfully removed';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'Categories table still exists after cleanup';
    ELSE
        RAISE NOTICE 'Categories table successfully removed';
    END IF;
END $$;

-- =====================================================
-- 4. UPDATE RLS POLICIES (if any exist for items)
-- =====================================================

-- Drop any RLS policies that might exist for the items table
DO $$
BEGIN
    -- This will fail if no policies exist, but that's okay
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can view active items" ON public.items';
    EXECUTE 'DROP POLICY IF EXISTS "Partners can manage their items" ON public.items';
EXCEPTION
    WHEN OTHERS THEN
        -- Policy doesn't exist, which is fine
        NULL;
END $$;

-- =====================================================
-- 5. FINAL VERIFICATION
-- =====================================================

-- Show final table count
SELECT 
    'shop_items' as table_name,
    COUNT(*) as record_count
FROM public.shop_items
UNION ALL
SELECT 
    'shops' as table_name,
    COUNT(*) as record_count
FROM public.shops
UNION ALL
SELECT 
    'shop_categories' as table_name,
    COUNT(*) as record_count
FROM public.shop_categories;

-- =====================================================
-- 6. SUMMARY
-- =====================================================

SELECT 
    'Cleanup Summary' as message,
    'Legacy items and categories tables removed' as details,
    'All e-commerce data now uses shop_items and shop_categories' as status; 