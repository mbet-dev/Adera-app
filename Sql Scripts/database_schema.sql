-- =====================================================
-- ADERA APP - COMPREHENSIVE DATABASE SCHEMA
-- Supabase PostgreSQL Database Setup
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "cube";
CREATE EXTENSION IF NOT EXISTS "earthdistance";

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles enum
CREATE TYPE user_role AS ENUM (
    'customer',
    'partner', 
    'driver',
    'staff',
    'admin'
);

-- Parcel status enum
CREATE TYPE parcel_status AS ENUM (
    'created',
    'dropoff',
    'facility_received',
    'in_transit_to_facility_hub',
    'in_transit_to_pickup_point',
    'pickup_ready',
    'delivered',
    'cancelled',
    'disputed'
);

-- Payment status enum
CREATE TYPE payment_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'cancelled'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
    'telebirr',
    'chapa',
    'arifpay',
    'cash_on_delivery',
    'wallet',
    'recipient_pays',
    'card_payment'
);

-- Package type enum
CREATE TYPE package_type AS ENUM (
    'document',
    'small',
    'medium',
    'large'
);

-- Notification type enum
CREATE TYPE notification_type AS ENUM (
    'parcel_created',
    'status_update',
    'payment_confirmed',
    'delivery_ready',
    'dispute_created',
    'system_alert'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    language TEXT DEFAULT 'en',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url TEXT,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table (pickup/dropoff points)
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
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- 5% default commission
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE IF NOT EXISTS public.drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    vehicle_type TEXT,
    vehicle_number TEXT,
    license_number TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    total_deliveries INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    rating DECIMAL(3,2) DEFAULT 0.00,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parcels table
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
    package_images TEXT[], -- Array of image URLs
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

-- Ensure dropoff_partner_id exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'parcels'
        AND column_name = 'dropoff_partner_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN dropoff_partner_id UUID REFERENCES public.partners(id);
    END IF;
END
$$;

-- Ensure pickup_partner_id exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'parcels'
        AND column_name = 'pickup_partner_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN pickup_partner_id UUID REFERENCES public.partners(id);
    END IF;
END
$$;

-- Ensure assigned_driver_id exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'parcels'
        AND column_name = 'assigned_driver_id'
    ) THEN
        ALTER TABLE public.parcels ADD COLUMN assigned_driver_id UUID REFERENCES public.drivers(id);
    END IF;
END
$$;

-- Parcel events table (for tracking history)
CREATE TABLE IF NOT EXISTS public.parcel_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    event_type parcel_status NOT NULL,
    actor_id UUID REFERENCES public.users(id),
    actor_role user_role NOT NULL,
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    location_address TEXT,
    notes TEXT,
    images TEXT[], -- Array of image URLs for evidence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id),
    amount DECIMAL(8,2) NOT NULL,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    gateway_transaction_id TEXT,
    gateway_response JSONB,
    commission_amount DECIMAL(8,2) DEFAULT 0.00,
    partner_commission DECIMAL(8,2) DEFAULT 0.00,
    driver_commission DECIMAL(8,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- E-COMMERCE TABLES
-- =====================================================

-- Partner shops table
CREATE TABLE IF NOT EXISTS public.shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    description TEXT,
    banner_url TEXT,
    logo_url TEXT,
    template_type TEXT DEFAULT 'default',
    primary_color TEXT DEFAULT '#3B82F6',
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    total_sales DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop categories table
CREATE TABLE IF NOT EXISTS public.shop_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop items table
CREATE TABLE IF NOT EXISTS public.shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.shop_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    quantity INTEGER DEFAULT 0,
    image_urls TEXT[], -- Array of image URLs
    delivery_supported BOOLEAN DEFAULT TRUE,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    sales_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop orders table
CREATE TABLE IF NOT EXISTS public.shop_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(8,2) DEFAULT 0.00,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    delivery_method TEXT DEFAULT 'adera_delivery',
    delivery_status parcel_status DEFAULT 'created',
    parcel_id UUID REFERENCES public.parcels(id),
    order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop transactions table
CREATE TABLE IF NOT EXISTS public.shop_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.shop_orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    commission_amount DECIMAL(8,2) DEFAULT 0.00,
    status payment_status DEFAULT 'pending',
    payout_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type NOT NULL,
    related_id UUID, -- Can reference parcels, orders, etc.
    related_type TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes table
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcel_id UUID REFERENCES public.parcels(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dispute_type TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_images TEXT[],
    status TEXT DEFAULT 'open',
    resolution TEXT,
    resolved_by UUID REFERENCES public.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Partners indexes
CREATE INDEX IF NOT EXISTS idx_partners_location ON public.partners USING GIST (
    ll_to_earth(latitude::double precision, longitude::double precision)
);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON public.partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_approved ON public.partners(is_approved);

-- Drivers indexes
CREATE INDEX IF NOT EXISTS idx_drivers_location ON public.drivers USING GIST (
    ll_to_earth(current_latitude::double precision, current_longitude::double precision)
);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON public.drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_available ON public.drivers(is_available);

-- Parcels indexes
CREATE INDEX IF NOT EXISTS idx_parcels_tracking_id ON public.parcels(tracking_id);
CREATE INDEX IF NOT EXISTS idx_parcels_sender_id ON public.parcels(sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels(status);
CREATE INDEX IF NOT EXISTS idx_parcels_driver_id ON public.parcels(assigned_driver_id);
CREATE INDEX IF NOT EXISTS idx_parcels_created_at ON public.parcels(created_at);

-- Parcel events indexes
CREATE INDEX IF NOT EXISTS idx_parcel_events_parcel_id ON public.parcel_events(parcel_id);
CREATE INDEX IF NOT EXISTS idx_parcel_events_created_at ON public.parcel_events(created_at);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_parcel_id ON public.transactions(parcel_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(payment_status);

-- Shop indexes
CREATE INDEX IF NOT EXISTS idx_shops_partner_id ON public.shops(partner_id);
CREATE INDEX IF NOT EXISTS idx_shops_approved ON public.shops(is_approved);

-- Shop items indexes
CREATE INDEX IF NOT EXISTS idx_shop_items_shop_id ON public.shop_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_category_id ON public.shop_items(category_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_active ON public.shop_items(is_active);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_parcel_id ON public.messages(parcel_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Partners policies
CREATE POLICY "Partners can view their own data" ON public.partners
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Partners can update their own data" ON public.partners
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view approved partners" ON public.partners
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage all partners" ON public.partners
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Drivers policies
CREATE POLICY "Drivers can view their own data" ON public.drivers
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Drivers can update their own data" ON public.drivers
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all drivers" ON public.drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Parcels policies
CREATE POLICY "Users can view their own parcels" ON public.parcels
    FOR SELECT USING (
        sender_id = auth.uid() OR 
        recipient_phone = (SELECT phone FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "Users can create parcels" ON public.parcels
    FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Partners can view assigned parcels" ON public.parcels
    FOR SELECT USING (
        dropoff_partner_id IN (
            SELECT id FROM public.partners WHERE user_id = auth.uid()
        ) OR
        pickup_partner_id IN (
            SELECT id FROM public.partners WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Drivers can view assigned parcels" ON public.parcels
    FOR SELECT USING (
        assigned_driver_id IN (
            SELECT id FROM public.drivers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all parcels" ON public.parcels
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Parcel events policies
CREATE POLICY "Users can view events for their parcels" ON public.parcel_events
    FOR SELECT USING (
        parcel_id IN (
            SELECT id FROM public.parcels 
            WHERE sender_id = auth.uid() OR 
                  recipient_phone = (SELECT phone FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Authorized users can create events" ON public.parcel_events
    FOR INSERT WITH CHECK (actor_id = auth.uid());

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON public.transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Shops policies
CREATE POLICY "Anyone can view approved shops" ON public.shops
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Partners can manage their own shops" ON public.shops
    FOR ALL USING (
        partner_id IN (
            SELECT id FROM public.partners WHERE user_id = auth.uid()
        )
    );

-- Shop items policies
CREATE POLICY "Anyone can view active items from approved shops" ON public.shop_items
    FOR SELECT USING (
        is_active = true AND
        shop_id IN (
            SELECT id FROM public.shops WHERE is_approved = true
        )
    );

CREATE POLICY "Partners can manage their shop items" ON public.shop_items
    FOR ALL USING (
        shop_id IN (
            SELECT s.id FROM public.shops s
            JOIN public.partners p ON s.partner_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Shop orders policies
CREATE POLICY "Buyers can view their own orders" ON public.shop_orders
    FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Partners can view orders for their shops" ON public.shop_orders
    FOR SELECT USING (
        shop_id IN (
            SELECT s.id FROM public.shops s
            JOIN public.partners p ON s.partner_id = p.id
            WHERE p.user_id = auth.uid()
        )
    );

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON public.messages
    FOR SELECT USING (
        sender_id = auth.uid() OR receiver_id = auth.uid()
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System settings policies
CREATE POLICY "Only admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Disputes policies
CREATE POLICY "Users can view disputes they reported" ON public.disputes
    FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Users can create disputes" ON public.disputes
    FOR INSERT WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can manage all disputes" ON public.disputes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate tracking ID
CREATE OR REPLACE FUNCTION generate_tracking_id()
RETURNS TRIGGER AS $$
BEGIN
    NEW.tracking_id = 'ADE' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate pickup code
CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TRIGGER AS $$
BEGIN
    NEW.pickup_code = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate delivery fee
CREATE OR REPLACE FUNCTION calculate_delivery_fee(
    p_package_type package_type,
    p_distance_km DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    base_fee DECIMAL := 50.00;
    type_multiplier DECIMAL;
    distance_fee DECIMAL;
BEGIN
    -- Package type multiplier
    CASE p_package_type
        WHEN 'document' THEN type_multiplier := 1.0;
        WHEN 'small' THEN type_multiplier := 1.2;
        WHEN 'medium' THEN type_multiplier := 1.5;
        WHEN 'large' THEN type_multiplier := 2.0;
    END CASE;
    
    -- Distance fee (10 ETB per km after first 5km)
    IF p_distance_km <= 5 THEN
        distance_fee := 0;
    ELSE
        distance_fee := (p_distance_km - 5) * 10;
    END IF;
    
    RETURN (base_fee * type_multiplier) + distance_fee;
END;
$$ LANGUAGE plpgsql;

-- Function to update parcel status
CREATE OR REPLACE FUNCTION update_parcel_status(
    p_parcel_id UUID,
    p_new_status parcel_status,
    p_actor_id UUID,
    p_actor_role user_role,
    p_notes TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update parcel status
    UPDATE public.parcels 
    SET status = p_new_status, updated_at = NOW()
    WHERE id = p_parcel_id;
    
    -- Create parcel event
    INSERT INTO public.parcel_events (
        parcel_id, event_type, actor_id, actor_role, notes
    ) VALUES (
        p_parcel_id, p_new_status, p_actor_id, p_actor_role, p_notes
    );
    
    -- Update delivery time if delivered
    IF p_new_status = 'delivered' THEN
        UPDATE public.parcels 
        SET actual_delivery_time = NOW()
        WHERE id = p_parcel_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to process commission
SET check_function_bodies = false;

DROP TRIGGER IF EXISTS process_commission_trigger ON public.transactions;
DROP FUNCTION IF EXISTS process_commission(UUID);
DROP FUNCTION IF EXISTS process_commission();

CREATE OR REPLACE FUNCTION process_commission()
RETURNS TRIGGER AS $$
DECLARE
    v_parcel_id UUID;
    v_amount DECIMAL;
    v_partner_id UUID;
    v_driver_id UUID;
    v_partner_commission DECIMAL;
    v_driver_commission DECIMAL;
BEGIN
    -- Get transaction details
    SELECT parcel_id, amount INTO v_parcel_id, v_amount
    FROM public.transactions
    WHERE id = NEW.id;
    
    -- Get parcel details
    SELECT dropoff_partner_id, assigned_driver_id 
    INTO v_partner_id, v_driver_id
    FROM public.parcels
    WHERE id = v_parcel_id;
    
    -- Calculate commissions (10% partner, 5% driver)
    v_partner_commission := v_amount * 0.10;
    v_driver_commission := v_amount * 0.05;
    
    -- Update transaction with commission amounts
    UPDATE public.transactions
    SET partner_commission = v_partner_commission,
        driver_commission = v_driver_commission
    WHERE id = NEW.id;
    
    -- Update partner earnings
    IF v_partner_id IS NOT NULL THEN
        UPDATE public.partners
        SET total_earnings = total_earnings + v_partner_commission
        WHERE id = v_partner_id;
    END IF;
    
    -- Update driver earnings
    IF v_driver_id IS NOT NULL THEN
        UPDATE public.drivers
        SET total_earnings = total_earnings + v_driver_commission,
            total_deliveries = total_deliveries + 1
        WHERE id = v_driver_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SET check_function_bodies = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON public.parcels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON public.shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON public.shop_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at BEFORE UPDATE ON public.shop_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate tracking ID trigger
CREATE TRIGGER generate_tracking_id_trigger BEFORE INSERT ON public.parcels
    FOR EACH ROW
    WHEN (NEW.tracking_id IS NULL)
    EXECUTE FUNCTION generate_tracking_id();

-- Auto-generate pickup code trigger
CREATE TRIGGER generate_pickup_code_trigger BEFORE INSERT ON public.parcels
    FOR EACH ROW
    WHEN (NEW.pickup_code IS NULL)
    EXECUTE FUNCTION generate_pickup_code();

CREATE TRIGGER process_commission_trigger AFTER UPDATE ON public.transactions
    FOR EACH ROW
    WHEN (OLD.payment_status = 'pending' AND NEW.payment_status = 'completed')
    EXECUTE FUNCTION process_commission();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('delivery_fees', '{"document": 50, "small": 60, "medium": 80, "large": 120}', 'Base delivery fees by package type'),
('commission_rates', '{"partner": 5, "driver": 10}', 'Commission rates as percentages'),
('payment_methods', '["telebirr", "chapa", "arifpay", "cash_on_delivery", "wallet"]', 'Available payment methods'),
('supported_languages', '["en", "am", "om", "ti", "so"]', 'Supported languages'),
('app_config', '{"name": "Adera", "version": "1.0.0", "environment": "development"}', 'App configuration')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users for public data
GRANT SELECT ON public.partners TO anon;
GRANT SELECT ON public.shops TO anon;
GRANT SELECT ON public.shop_items TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';
COMMENT ON TABLE public.partners IS 'Pickup/dropoff point partners';
COMMENT ON TABLE public.drivers IS 'Delivery drivers';
COMMENT ON TABLE public.parcels IS 'Parcel delivery records';
COMMENT ON TABLE public.parcel_events IS 'Parcel tracking events';
COMMENT ON TABLE public.transactions IS 'Payment transactions';
COMMENT ON TABLE public.shops IS 'Partner e-commerce shops';
COMMENT ON TABLE public.shop_items IS 'Items sold in partner shops';
COMMENT ON TABLE public.shop_orders IS 'Orders from partner shops';
COMMENT ON TABLE public.messages IS 'In-app messaging system';
COMMENT ON TABLE public.notifications IS 'System notifications';
COMMENT ON TABLE public.disputes IS 'Dispute resolution system';

-- =====================================================
-- END OF SCHEMA
-- ===================================================== 