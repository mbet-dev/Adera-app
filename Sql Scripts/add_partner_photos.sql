-- =================================================================
-- MIGRATION SCRIPT: Add photo_url to partners table and populate it
-- =================================================================

-- Step 1: Add the photo_url column to the partners table
-- This column will store the URL to the partner's location picture.
ALTER TABLE public.partners
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Step 2: Populate the new photo_url column for existing partners
-- This script will update all existing partners with a randomly selected photo
-- from a predefined list of images.

-- IMPORTANT: Replace 'YOUR_SUPABASE_PROJECT_ID' with your actual Supabase project ID.
-- The images are assumed to be uploaded to a 'partner-photos' bucket in Supabase Storage.
DO $$
DECLARE
    photo_list TEXT[] := ARRAY[
        '0_Forsyths-music-shop-is-one-of-the-oldest-local-businesses-in-Manchester.webp',
        '1214812484.webp',
        '400_SW.webp',
        '4500.webp',
        '4745.avif',
        '5472.avif',
        'Coronavirus-Lockdown-Forces-Londons-Small-Businesses-To-Make-Hard-Choices-1220780371-1.webp',
        'Hub - istockphoto-175407605-612x612.jpg',
        'Hub - istockphoto-495122722-612x612.jpg',
        'Hub-1 - istockphoto-1188198005-1024x1024.jpg',
        'Hub-2 - istockphoto-1167235640-2048x2048.jpg',
        'Small-Businesses-scaled-2560x1280 (1).jpg',
        'TheBrassOwl.png',
        'astoria-queens-ny-may-3-600nw-1049920259.webp',
        'images (1).jpeg',
        'images (10).jpeg',
        'images (11).jpeg',
        'images (12).jpeg',
        'images (13).jpeg',
        'images (14).jpeg',
        'images (15).jpeg',
        'images (16).jpeg',
        'images (2).jpeg',
        'images (3).jpeg',
        'images (4).jpeg',
        'images (5).jpeg',
        'images (6).jpeg',
        'images (7).jpeg',
        'images (8).jpeg',
        'images (9).jpeg',
        'images.jpeg',
        'istockphoto-644073584-612x612.jpg',
        'istockphoto-915082340-612x612.jpg',
        'placeholder-1a.jpeg',
        'pngIconAderaX1.png',
        'small-business-saturday.webp',
        'small-town-antiques-store-or-storefront-with-a-going-out-of-business-sign-in-the-window-in-warm-springs-georgia-usa-R9TTA6.jpg',
        'srpbj7jo5ye21.webp'
    ];
    partner_record RECORD;
    random_photo TEXT;
    base_url TEXT := 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co/storage/v1/object/public/partner-photos/';
BEGIN
    FOR partner_record IN SELECT id FROM public.partners WHERE photo_url IS NULL LOOP
        -- Get a random photo from the list
        random_photo := photo_list[1 + floor(random() * array_length(photo_list, 1))];
        
        -- Update the partner record with the full URL
        UPDATE public.partners
        SET photo_url = base_url || random_photo
        WHERE id = partner_record.id;
    END LOOP;
END $$;

-- =================================================================
-- END OF MIGRATION SCRIPT
-- =================================================================