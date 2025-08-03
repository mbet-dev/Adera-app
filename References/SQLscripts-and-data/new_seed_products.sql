
-- This script is idempotent and can be run multiple times without creating duplicate data.

-- Update existing shop_categories with icon_urls where they are currently null
UPDATE public.shop_categories
SET icon_url = 
    CASE 
        WHEN name = 'Electronics' THEN 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'
        WHEN name = 'Fashion' THEN 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100'
        WHEN name = 'Books' THEN 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'
        WHEN name = 'Home & Garden' THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100'
        ELSE icon_url
    END
WHERE icon_url IS NULL;

-- Add new shop items in a single, idempotent query
INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
VALUES 
    -- Electronics
    ('7ce6560c-6265-4d11-a577-70d703561e35', 'e65c14ab-557d-4d02-b643-3832632ab9f9', 'Samsung Galaxy S25', 'High-quality Samsung Galaxy S25 from Ethiopia.', 9500, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400']), 
    ('7ce6560c-6265-4d11-a577-70d703561e35', 'e65c14ab-557d-4d02-b643-3832632ab9f9', 'Tecno Phantom V Fold', 'High-quality Tecno Phantom V Fold from Ethiopia.', 8500, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400']), 
    -- Fashion
    ('7ce6560c-6265-4d11-a577-70d703561e35', '42b27620-cfa7-4a53-9ad8-1ab9f4248734', 'Men''s Leather Jacket', 'Stylish Men''s Leather Jacket made with the finest materials.', 3500, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400']), 
    ('7ce6560c-6265-4d11-a577-70d703561e35', '42b27620-cfa7-4a53-9ad8-1ab9f4248734', 'Women''s Summer Dress', 'Stylish Women''s Summer Dress made with the finest materials.', 2500, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', ARRAY['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400']), 
    -- Books
    ('7ce6560c-6265-4d11-a577-70d703561e35', '2517bdf0-2374-4667-a7ab-c4e4c1d6651b', 'Fikir Eske Mekabir', 'A captivating book: Fikir Eske Mekabir', 500, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400']), 
    ('7ce6560c-6265-4d11-a577-70d703561e35', '2517bdf0-2374-4667-a7ab-c4e4c1d6651b', 'Oromay', 'A captivating book: Oromay', 450, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400']), 
    -- Home & Garden
    ('7ce6560c-6265-4d11-a577-70d703561e35', 'a1743363-b709-461f-b7e1-32ba27e9edba', 'Coffee Ceremony Set', 'Beautiful Coffee Ceremony Set to decorate your home.', 1500, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400']), 
    ('7ce6560c-6265-4d11-a577-70d703561e35', 'a1743363-b709-461f-b7e1-32ba27e9edba', 'Jebena (Coffee Pot)', 'Beautiful Jebena (Coffee Pot) to decorate your home.', 800, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'])
ON CONFLICT (name, shop_id) DO NOTHING;
