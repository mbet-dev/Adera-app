-- This script removes all shop categories named 'General' and their associated shop items.

-- Delete shop items associated with 'General' categories
DELETE FROM public.shop_items
WHERE category_id IN (SELECT id FROM public.shop_categories WHERE name = 'General');

-- Delete the 'General' categories themselves
DELETE FROM public.shop_categories
WHERE name = 'General';
