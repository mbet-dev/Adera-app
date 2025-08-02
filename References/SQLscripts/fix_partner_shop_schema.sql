-- =====================================================
-- ADERA PARTNER SHOP SCHEMA FIX SCRIPT
-- =====================================================
-- This script fixes partner shop schema issues and creates missing shop records
-- Run this script to ensure all partners have associated shops

-- =====================================================
-- 1. ENSURE PARTNERS TABLE HAS CORRECT STRUCTURE
-- =====================================================

-- Check if partners table exists and has correct structure
DO $$
BEGIN
    -- Create partners table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'partners') THEN
        CREATE TABLE public.partners (
            business_logo_url text,
            business_images text[],
            store_front_image text,
            interior_images text[],
            photo_url text,
            is_facility boolean NOT NULL DEFAULT false,
            photos text[] NOT NULL DEFAULT ARRAY[]::text[],
            user_id uuid,
            business_name text NOT NULL,
            business_license text,
            business_category text,
            address text NOT NULL,
            latitude numeric NOT NULL,
            longitude numeric NOT NULL,
            phone text NOT NULL,
            email text,
            operating_hours jsonb,
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            accepted_payment_methods text[] DEFAULT ARRAY['cash_on_delivery'],
            is_approved boolean DEFAULT false,
            is_active boolean DEFAULT true,
            commission_rate numeric DEFAULT 5.00,
            total_earnings numeric DEFAULT 0.00,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            CONSTRAINT partners_pkey PRIMARY KEY (id),
            CONSTRAINT partners_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
            CONSTRAINT partners_user_id_unique UNIQUE (user_id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_partners_user_id ON public.partners(user_id);
        CREATE INDEX IF NOT EXISTS idx_partners_is_active ON public.partners(is_active);
        CREATE INDEX IF NOT EXISTS idx_partners_is_approved ON public.partners(is_approved);
    ELSE
        -- Add unique constraint if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'partners_user_id_unique') THEN
            ALTER TABLE public.partners ADD CONSTRAINT partners_user_id_unique UNIQUE (user_id);
        END IF;
    END IF;
END $$;

-- =====================================================
-- 2. ENSURE SHOPS TABLE HAS CORRECT STRUCTURE
-- =====================================================

-- Check if shops table exists and has correct structure
DO $$
BEGIN
    -- Create shops table if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shops') THEN
        CREATE TABLE public.shops (
            shop_images text[],
            is_featured boolean DEFAULT true,
            partner_id uuid,
            shop_name text NOT NULL UNIQUE,
            description text,
            banner_url text,
            logo_url text,
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            template_type text DEFAULT 'default',
            primary_color text DEFAULT '#3B82F6',
            is_approved boolean DEFAULT false,
            is_active boolean DEFAULT true,
            total_sales numeric DEFAULT 0.00,
            total_orders integer DEFAULT 0,
            rating numeric DEFAULT 0.00,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            review_count integer DEFAULT 0,
            CONSTRAINT shops_pkey PRIMARY KEY (id),
            CONSTRAINT shops_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
        );
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_shops_partner_id ON public.shops(partner_id);
        CREATE INDEX IF NOT EXISTS idx_shops_is_active ON public.shops(is_active);
        CREATE INDEX IF NOT EXISTS idx_shops_is_approved ON public.shops(is_approved);
    END IF;
END $$;

-- =====================================================
-- 3. CREATE MISSING PARTNERS FOR EXISTING USERS
-- =====================================================

-- Create partners for users who don't have them yet
INSERT INTO public.partners (
    user_id,
    business_name,
    address,
    latitude,
    longitude,
    phone,
    email,
    is_approved,
    is_active,
    created_at,
    updated_at
)
SELECT 
    u.id as user_id,
    COALESCE(u.first_name || ' ' || u.last_name, 'Partner Business') as business_name,
    'Addis Ababa, Ethiopia' as address,
    9.1450 as latitude,
    40.4897 as longitude,
    COALESCE(u.phone, '+251900000000') as phone,
    u.email,
    true as is_approved,
    true as is_active,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE LOWER(u.role::text) = 'partner'  -- Cast enum to text first, then use LOWER
AND NOT EXISTS (
    SELECT 1 FROM public.partners p WHERE p.user_id = u.id
);

-- =====================================================
-- 4. CREATE SAMPLE PARTNERS FOR TESTING (MIX OF DELIVERY-ONLY AND SHOP PARTNERS)
-- =====================================================

-- Use existing partner users instead of creating new ones
-- Create partners for existing users who don't have partner records yet

-- Create sample delivery-only partners (without shops) using existing users
INSERT INTO public.partners (
    user_id,
    business_name,
    address,
    latitude,
    longitude,
    phone,
    email,
    is_approved,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    u.id as user_id,
    'Bole Mini Market' as business_name,
    'Bole, Addis Ababa, Ethiopia' as address,
    8.9806 as latitude,
    38.7578 as longitude,
    u.phone,
    u.email,
    true as is_approved,
    true as is_active,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE u.email = 'bole.mini@adera.et'
AND NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = u.id)

UNION ALL

SELECT 
    u.id as user_id,
    'Bole Pharmacy' as business_name,
    'Bole, Addis Ababa, Ethiopia' as address,
    8.9806 as latitude,
    38.7578 as longitude,
    u.phone,
    u.email,
    true as is_approved,
    true as is_active,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE u.email = 'bole.pharmacy@adera.et'
AND NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = u.id);

-- Create sample shop partners (with shops) using existing users
INSERT INTO public.partners (
    user_id,
    business_name,
    address,
    latitude,
    longitude,
    phone,
    email,
    is_approved,
    is_active,
    created_at,
    updated_at
)
SELECT 
    u.id as user_id,
    'Kazanchis Shop' as business_name,
    'Kazanchis, Addis Ababa, Ethiopia' as address,
    9.1450 as latitude,
    40.4897 as longitude,
    u.phone,
    u.email,
    true as is_approved,
    true as is_active,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE u.email = 'kazanchis.shop@adera.et'
AND NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = u.id)

UNION ALL

SELECT 
    u.id as user_id,
    'Meskel Square Market' as business_name,
    'Meskel Square, Addis Ababa, Ethiopia' as address,
    9.0000 as latitude,
    38.7500 as longitude,
    u.phone,
    u.email,
    true as is_approved,
    true as is_active,
    now() as created_at,
    now() as updated_at
FROM public.users u
WHERE u.email = 'meskel.shop@adera.et'
AND NOT EXISTS (SELECT 1 FROM public.partners p WHERE p.user_id = u.id);

-- =====================================================
-- 5. CREATE SHOP RECORDS FOR EXISTING PARTNERS WHO NEED THEM
-- =====================================================

-- Create shops for existing partners who don't have shop records yet
INSERT INTO public.shops (
    partner_id,
    shop_name,
    description,
    is_approved,
    is_active,
    created_at,
    updated_at
)
SELECT 
    p.id as partner_id,
    p.business_name as shop_name,
    'Welcome to ' || p.business_name || ' - Your trusted partner for quality products and services.' as description,
    p.is_approved,
    p.is_active,
    now() as created_at,
    now() as updated_at
FROM public.partners p
WHERE NOT EXISTS (
    SELECT 1 FROM public.shops s WHERE s.partner_id = p.id
)
AND p.user_id IN (
    'eb715561-e3fa-478d-bdae-5463e9d9d7cd',  -- Kazanchis Shop
    'f4590342-5b63-45b6-b81d-0cdfa3ca7769',  -- Meskel Shop
    'da4757ec-a029-4e1a-9dbd-1468b6554e3c',  -- Bole Mini
    'a651438c-9c1f-4f6c-831f-25c00b3dbef8'   -- Bole Pharmacy
);

-- =====================================================
-- 6. CREATE MISSING SHOP RECORDS FOR PARTNERS
-- =====================================================

-- Insert shop records for partners who don't have shop records
INSERT INTO public.shops (
    partner_id,
    shop_name,
    description,
    is_approved,
    is_active,
    created_at,
    updated_at
)
SELECT 
    p.id as partner_id,
    p.business_name as shop_name,
    'Welcome to ' || p.business_name || ' - Your trusted partner for quality products and services.' as description,
    p.is_approved,
    p.is_active,
    now() as created_at,
    now() as updated_at
FROM public.partners p
WHERE NOT EXISTS (
    SELECT 1 FROM public.shops s WHERE s.partner_id = p.id
);

-- =====================================================
-- 7. CREATE DEFAULT SHOP CATEGORIES FOR NEW SHOPS
-- =====================================================

-- Ensure shop_categories table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shop_categories') THEN
        CREATE TABLE public.shop_categories (
            shop_id uuid,
            name text NOT NULL,
            icon_url text,
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            sort_order integer DEFAULT 0,
            created_at timestamp with time zone DEFAULT now(),
            CONSTRAINT shop_categories_pkey PRIMARY KEY (id),
            CONSTRAINT shop_categories_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shops(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_shop_categories_shop_id ON public.shop_categories(shop_id);
    END IF;
END $$;

-- Insert default categories for shops that don't have any
INSERT INTO public.shop_categories (
    shop_id,
    name,
    sort_order,
    created_at
)
SELECT 
    s.id as shop_id,
    'General' as name,
    1 as sort_order,
    now() as created_at
FROM public.shops s
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_categories sc WHERE sc.shop_id = s.id
);

-- =====================================================
-- 8. CREATE DEFAULT SHOP ITEMS FOR NEW SHOPS
-- =====================================================

-- Ensure shop_items table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shop_items') THEN
        CREATE TABLE public.shop_items (
            main_image_url text,
            product_videos text[],
            is_auction boolean DEFAULT false,
            is_negotiable boolean DEFAULT false,
            auction_start_price numeric,
            auction_end_time timestamp with time zone,
            buy_now_price numeric,
            brand text,
            product_attributes jsonb,
            shop_id uuid,
            category_id uuid,
            name text NOT NULL,
            description text,
            price numeric NOT NULL,
            original_price numeric,
            image_urls text[],
            id uuid NOT NULL DEFAULT uuid_generate_v4(),
            quantity integer DEFAULT 0,
            delivery_supported boolean DEFAULT true,
            delivery_fee numeric DEFAULT 0.00,
            is_active boolean DEFAULT true,
            is_featured boolean DEFAULT false,
            views_count integer DEFAULT 0,
            sales_count integer DEFAULT 0,
            rating numeric DEFAULT 0.00,
            created_at timestamp with time zone DEFAULT now(),
            updated_at timestamp with time zone DEFAULT now(),
            review_count integer DEFAULT 0,
            CONSTRAINT shop_items_pkey PRIMARY KEY (id),
            CONSTRAINT shop_items_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shops(id),
            CONSTRAINT shop_items_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.shop_categories(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_shop_items_shop_id ON public.shop_items(shop_id);
        CREATE INDEX IF NOT EXISTS idx_shop_items_category_id ON public.shop_items(category_id);
        CREATE INDEX IF NOT EXISTS idx_shop_items_is_active ON public.shop_items(is_active);
    END IF;
END $$;

-- Insert sample items for shops that don't have any items
INSERT INTO public.shop_items (
    shop_id,
    category_id,
    name,
    description,
    price,
    quantity,
    delivery_supported,
    delivery_fee,
    is_active,
    is_featured,
    created_at,
    updated_at
)
SELECT 
    s.id as shop_id,
    sc.id as category_id,
    'Sample Product' as name,
    'This is a sample product. Please update with your actual inventory.' as description,
    100.00 as price,
    10 as quantity,
    true as delivery_supported,
    50.00 as delivery_fee,
    true as is_active,
    true as is_featured,
    now() as created_at,
    now() as updated_at
FROM public.shops s
JOIN public.shop_categories sc ON sc.shop_id = s.id
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_items si WHERE si.shop_id = s.id
)
AND sc.name = 'General';

-- =====================================================
-- 2.5. CHECK AND FIX ENUM VALUES
-- =====================================================

-- Check if user_role enum type exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Create the enum type if it doesn't exist
        CREATE TYPE user_role AS ENUM ('customer', 'partner', 'driver', 'admin');
    END IF;
END $$;

-- Check what enum values exist
SELECT unnest(enum_range(NULL::user_role)) as valid_roles;

-- Update user roles to ensure they match the enum values
-- First, let's see what roles we have
SELECT DISTINCT role FROM public.users WHERE role IS NOT NULL;

-- Update roles to match enum values (assuming enum uses lowercase)
UPDATE public.users 
SET role = LOWER(role::text)::user_role
WHERE role IS NOT NULL 
AND role::text != LOWER(role::text);

-- If the enum uses uppercase, use this instead:
-- UPDATE public.users 
-- SET role = UPPER(role)
-- WHERE role IS NOT NULL 
-- AND role != UPPER(role);

-- =====================================================
-- 9. UPDATE USER ROLES TO ENSURE CONSISTENCY
-- =====================================================

-- Update user roles to ensure they are uppercase
-- UPDATE public.users 
-- SET role = UPPER(role)
-- WHERE role IS NOT NULL 
-- AND role != UPPER(role);

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Verify partners exist (shops are optional)
SELECT 
    'Total partners' as check_type,
    COUNT(*) as count
FROM public.partners p
UNION ALL
SELECT 
    'Partners with shops' as check_type,
    COUNT(*) as count
FROM public.partners p
WHERE EXISTS (
    SELECT 1 FROM public.shops s WHERE s.partner_id = p.id
)
UNION ALL
SELECT 
    'Partners without shops (delivery-only)' as check_type,
    COUNT(*) as count
FROM public.partners p
WHERE NOT EXISTS (
    SELECT 1 FROM public.shops s WHERE s.partner_id = p.id
)
UNION ALL
SELECT 
    'Shops without categories' as check_type,
    COUNT(*) as count
FROM public.shops s
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_categories sc WHERE sc.shop_id = s.id
)
UNION ALL
SELECT 
    'Shops without items' as check_type,
    COUNT(*) as count
FROM public.shops s
WHERE NOT EXISTS (
    SELECT 1 FROM public.shop_items si WHERE si.shop_id = s.id
);

-- =====================================================
-- 11. SUMMARY REPORT
-- =====================================================

SELECT 
    'Schema Fix Complete' as status,
    'Partners can now exist without shops. Shops are optional and only created when needed.' as message,
    now() as completed_at; 