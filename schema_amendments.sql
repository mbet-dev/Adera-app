-- =====================================================
-- ADERA APP - SCHEMA AMENDMENTS FOR IMAGE SUPPORT
-- Safe script to add image fields to existing tables
-- =====================================================

-- =====================================================
-- ADD IMAGE FIELDS TO EXISTING TABLES
-- =====================================================

-- Add image fields to users table
DO $$
BEGIN
    -- Add profile_image_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'profile_image_url'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_image_url TEXT;
    END IF;

    -- Add profile_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'profile_images'
    ) THEN
        ALTER TABLE public.users ADD COLUMN profile_images TEXT[];
    END IF;
END
$$;

-- Add image fields to partners table
DO $$
BEGIN
    -- Add business_logo_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'partners' 
        AND column_name = 'business_logo_url'
    ) THEN
        ALTER TABLE public.partners ADD COLUMN business_logo_url TEXT;
    END IF;

    -- Add business_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'partners' 
        AND column_name = 'business_images'
    ) THEN
        ALTER TABLE public.partners ADD COLUMN business_images TEXT[];
    END IF;

    -- Add store_front_image if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'partners' 
        AND column_name = 'store_front_image'
    ) THEN
        ALTER TABLE public.partners ADD COLUMN store_front_image TEXT;
    END IF;

    -- Add interior_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'partners' 
        AND column_name = 'interior_images'
    ) THEN
        ALTER TABLE public.partners ADD COLUMN interior_images TEXT[];
    END IF;
END
$$;

-- Add image fields to parcels table
DO $$
BEGIN
    -- Add package_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcels' 
        AND column_name = 'package_images'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN package_images TEXT[];
    END IF;

    -- Add damage_photos array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcels' 
        AND column_name = 'damage_photos'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN damage_photos TEXT[];
    END IF;
END
$$;

-- Add image fields to shops table
DO $$
BEGIN
    -- Add banner_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shops' 
        AND column_name = 'banner_url'
    ) THEN
        ALTER TABLE public.shops ADD COLUMN banner_url TEXT;
    END IF;

    -- Add logo_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shops' 
        AND column_name = 'logo_url'
    ) THEN
        ALTER TABLE public.shops ADD COLUMN logo_url TEXT;
    END IF;

    -- Add shop_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shops' 
        AND column_name = 'shop_images'
    ) THEN
        ALTER TABLE public.shops ADD COLUMN shop_images TEXT[];
    END IF;
END
$$;

-- Add image fields to shop_items table
DO $$
BEGIN
    -- Add main_image_url if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shop_items' 
        AND column_name = 'main_image_url'
    ) THEN
        ALTER TABLE public.shop_items ADD COLUMN main_image_url TEXT;
    END IF;

    -- Add product_videos array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shop_items' 
        AND column_name = 'product_videos'
    ) THEN
        ALTER TABLE public.shop_items ADD COLUMN product_videos TEXT[];
    END IF;

    -- Rename image_urls to image_urls if it exists as image_urls
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'shop_items' 
        AND column_name = 'image_urls'
    ) THEN
        -- Column already exists, no need to rename
        NULL;
    ELSE
        -- Add image_urls array if it doesn't exist
        ALTER TABLE public.shop_items ADD COLUMN image_urls TEXT[];
    END IF;
END
$$;

-- Add image fields to parcel_events table
DO $$
BEGIN
    -- Add images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcel_events' 
        AND column_name = 'images'
    ) THEN
        ALTER TABLE public.parcel_events ADD COLUMN images TEXT[];
    END IF;
END
$$;

-- Add image fields to disputes table
DO $$
BEGIN
    -- Add evidence_images array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'disputes' 
        AND column_name = 'evidence_images'
    ) THEN
        ALTER TABLE public.disputes ADD COLUMN evidence_images TEXT[];
    END IF;

    -- Add evidence_videos array if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'disputes' 
        AND column_name = 'evidence_videos'
    ) THEN
        ALTER TABLE public.disputes ADD COLUMN evidence_videos TEXT[];
    END IF;
END
$$;

-- =====================================================
-- ADD MISSING TABLES IF THEY DON'T EXIST
-- =====================================================

-- Create disputes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_images TEXT[], -- Array of evidence photos (max 6)
    evidence_videos TEXT[], -- Array of evidence videos (max 2)
    status TEXT DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add missing columns to parcels table
DO $$
BEGIN
    -- Add dropoff_partner_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcels' 
        AND column_name = 'dropoff_partner_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN dropoff_partner_id UUID REFERENCES public.partners(id);
    END IF;

    -- Add pickup_partner_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcels' 
        AND column_name = 'pickup_partner_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN pickup_partner_id UUID REFERENCES public.partners(id);
    END IF;

    -- Add assigned_driver_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'parcels' 
        AND column_name = 'assigned_driver_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN assigned_driver_id UUID REFERENCES public.drivers(id);
    END IF;
END
$$;

-- =====================================================
-- ADD INDEXES FOR PERFORMANCE
-- =====================================================

-- Add indexes for image-related queries
CREATE INDEX IF NOT EXISTS idx_users_profile_images ON public.users USING GIN(profile_images);
CREATE INDEX IF NOT EXISTS idx_partners_business_images ON public.partners USING GIN(business_images);
CREATE INDEX IF NOT EXISTS idx_partners_interior_images ON public.partners USING GIN(interior_images);
CREATE INDEX IF NOT EXISTS idx_parcels_package_images ON public.parcels USING GIN(package_images);
CREATE INDEX IF NOT EXISTS idx_parcels_damage_photos ON public.parcels USING GIN(damage_photos);
CREATE INDEX IF NOT EXISTS idx_shops_shop_images ON public.shops USING GIN(shop_images);
CREATE INDEX IF NOT EXISTS idx_shop_items_image_urls ON public.shop_items USING GIN(image_urls);
CREATE INDEX IF NOT EXISTS idx_shop_items_product_videos ON public.shop_items USING GIN(product_videos);
CREATE INDEX IF NOT EXISTS idx_parcel_events_images ON public.parcel_events USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_disputes_evidence_images ON public.disputes USING GIN(evidence_images);
CREATE INDEX IF NOT EXISTS idx_disputes_evidence_videos ON public.disputes USING GIN(evidence_videos);

-- =====================================================
-- ADD SYSTEM SETTINGS FOR IMAGE CONFIGURATION
-- =====================================================

-- Insert or update image-related system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('image_limits', '{"users": 4, "partners": 4, "shop_items": 4, "parcels": 4, "disputes": 6}', 'Maximum number of images per entity'),
('file_size_limits', '{"image": 5242880, "video": 52428800}', 'File size limits in bytes (5MB for images, 50MB for videos)'),
('image_storage_config', '{"bucket": "adera-images", "folder_structure": "entity_type/entity_id/", "allowed_formats": ["jpg", "jpeg", "png", "webp"]}', 'Image storage configuration'),
('video_storage_config', '{"bucket": "adera-videos", "folder_structure": "entity_type/entity_id/", "allowed_formats": ["mp4", "mov", "avi"], "max_duration": 300}', 'Video storage configuration')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- ADD COMMENTS FOR NEW FIELDS
-- =====================================================

-- Add comments for new image fields
COMMENT ON COLUMN public.users.profile_image_url IS 'Main profile picture URL';
COMMENT ON COLUMN public.users.profile_images IS 'Array of additional profile images (max 4)';
COMMENT ON COLUMN public.partners.business_logo_url IS 'Main business logo URL';
COMMENT ON COLUMN public.partners.business_images IS 'Array of business/store photos (max 4)';
COMMENT ON COLUMN public.partners.store_front_image IS 'Main store front photo URL';
COMMENT ON COLUMN public.partners.interior_images IS 'Array of interior photos (max 3)';
COMMENT ON COLUMN public.parcels.package_images IS 'Array of package photos (max 4) - for visual verification';
COMMENT ON COLUMN public.parcels.damage_photos IS 'Array of damage photos (max 4) - for complaints/disputes';
COMMENT ON COLUMN public.shops.banner_url IS 'Main shop banner URL';
COMMENT ON COLUMN public.shops.logo_url IS 'Shop logo URL';
COMMENT ON COLUMN public.shops.shop_images IS 'Array of shop photos (max 4)';
COMMENT ON COLUMN public.shop_items.main_image_url IS 'Main product image URL';
COMMENT ON COLUMN public.shop_items.image_urls IS 'Array of additional product images (max 4)';
COMMENT ON COLUMN public.shop_items.product_videos IS 'Array of product video URLs (max 2)';
COMMENT ON COLUMN public.parcel_events.images IS 'Array of image URLs for evidence';
COMMENT ON COLUMN public.disputes.evidence_images IS 'Array of evidence photos (max 6)';
COMMENT ON COLUMN public.disputes.evidence_videos IS 'Array of evidence videos (max 2)';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Verify all image fields were added successfully
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'partners', 'parcels', 'shops', 'shop_items', 'parcel_events', 'disputes')
AND column_name LIKE '%image%' OR column_name LIKE '%photo%' OR column_name LIKE '%video%'
ORDER BY table_name, column_name;

-- =====================================================
-- END OF SCHEMA AMENDMENTS
-- ===================================================== 