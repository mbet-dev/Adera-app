-- =====================================================
-- TEST PRODUCT TYPES: Auction, Negotiable, Fixed
-- This script creates test products for each type
-- to verify the ProductDetail screen functionality
-- =====================================================

-- =====================================================
-- 1. ENSURE WE HAVE TEST SHOPS AND CATEGORIES
-- =====================================================

-- Create test shop if it doesn't exist
INSERT INTO public.shops (partner_id, shop_name, description, is_approved, is_active)
SELECT 
  p.id,
  'Test Shop - Product Types',
  'Test shop for verifying different product types',
  true,
  true
FROM public.partners p
WHERE p.business_name LIKE '%Kazanchis%'
LIMIT 1
ON CONFLICT (shop_name) DO NOTHING;

-- Create test categories
INSERT INTO public.shop_categories (shop_id, name, sort_order)
SELECT 
  s.id,
  unnest(ARRAY['Electronics', 'Fashion', 'Books', 'Home & Garden']),
  unnest(ARRAY[1, 2, 3, 4])
FROM public.shops s
WHERE s.shop_name = 'Test Shop - Product Types'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. CREATE TEST PRODUCTS FOR EACH TYPE
-- =====================================================

-- Insert Auction Products
INSERT INTO public.shop_items (
  shop_id, category_id, name, description, price, original_price, 
  quantity, image_urls, delivery_supported, delivery_fee, 
  is_active, is_featured, views_count, sales_count, rating,
  is_auction, auction_end_time, is_negotiable
)
SELECT 
  s.id,
  sc.id,
  CASE sc.name
    WHEN 'Electronics' THEN 'iPhone 15 Pro - Auction'
    WHEN 'Fashion' THEN 'Designer Watch - Auction'
    WHEN 'Books' THEN 'Rare First Edition - Auction'
    WHEN 'Home & Garden' THEN 'Antique Vase - Auction'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 'Latest iPhone model, auction ends in 3 days'
    WHEN 'Fashion' THEN 'Luxury designer watch, bidding starts at 50,000 ETB'
    WHEN 'Books' THEN 'Rare first edition book, collectors item'
    WHEN 'Home & Garden' THEN 'Beautiful antique vase, perfect for decoration'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 45000
    WHEN 'Fashion' THEN 50000
    WHEN 'Books' THEN 15000
    WHEN 'Home & Garden' THEN 25000
  END,
  NULL, -- original_price for auction items
  1, -- quantity
  ARRAY['https://via.placeholder.com/300x200?text=Auction+Product'],
  true,
  500,
  true,
  true,
  150,
  0,
  4.8,
  true, -- is_auction
  NOW() + INTERVAL '3 days', -- auction_end_time
  false -- is_negotiable
FROM public.shops s
JOIN public.shop_categories sc ON s.id = sc.shop_id
WHERE s.shop_name = 'Test Shop - Product Types'
ON CONFLICT DO NOTHING;

-- Insert Negotiable Products
INSERT INTO public.shop_items (
  shop_id, category_id, name, description, price, original_price, 
  quantity, image_urls, delivery_supported, delivery_fee, 
  is_active, is_featured, views_count, sales_count, rating,
  is_auction, auction_end_time, is_negotiable
)
SELECT 
  s.id,
  sc.id,
  CASE sc.name
    WHEN 'Electronics' THEN 'MacBook Air - Negotiable'
    WHEN 'Fashion' THEN 'Leather Jacket - Negotiable'
    WHEN 'Books' THEN 'Textbook Collection - Negotiable'
    WHEN 'Home & Garden' THEN 'Garden Furniture Set - Negotiable'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 'Excellent condition MacBook, price negotiable'
    WHEN 'Fashion' THEN 'High-quality leather jacket, make an offer'
    WHEN 'Books' THEN 'Complete textbook collection, negotiable price'
    WHEN 'Home & Garden' THEN 'Beautiful garden furniture, open to offers'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 75000
    WHEN 'Fashion' THEN 12000
    WHEN 'Books' THEN 8000
    WHEN 'Home & Garden' THEN 35000
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 85000
    WHEN 'Fashion' THEN 15000
    WHEN 'Books' THEN 10000
    WHEN 'Home & Garden' THEN 45000
  END,
  5, -- quantity
  ARRAY['https://via.placeholder.com/300x200?text=Negotiable+Product'],
  true,
  800,
  true,
  true,
  200,
  2,
  4.5,
  false, -- is_auction
  NULL, -- auction_end_time
  true -- is_negotiable
FROM public.shops s
JOIN public.shop_categories sc ON s.id = sc.shop_id
WHERE s.shop_name = 'Test Shop - Product Types'
ON CONFLICT DO NOTHING;

-- Insert Fixed Price (Buy Now) Products
INSERT INTO public.shop_items (
  shop_id, category_id, name, description, price, original_price, 
  quantity, image_urls, delivery_supported, delivery_fee, 
  is_active, is_featured, views_count, sales_count, rating,
  is_auction, auction_end_time, is_negotiable
)
SELECT 
  s.id,
  sc.id,
  CASE sc.name
    WHEN 'Electronics' THEN 'Wireless Headphones - Buy Now'
    WHEN 'Fashion' THEN 'Casual T-Shirt - Buy Now'
    WHEN 'Books' THEN 'Programming Guide - Buy Now'
    WHEN 'Home & Garden' THEN 'Plant Pot Set - Buy Now'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 'High-quality wireless headphones with noise cancellation'
    WHEN 'Fashion' THEN 'Comfortable cotton t-shirt, multiple colors available'
    WHEN 'Books' THEN 'Comprehensive programming guide for beginners'
    WHEN 'Home & Garden' THEN 'Beautiful ceramic plant pots, set of 3'
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 8500
    WHEN 'Fashion' THEN 1200
    WHEN 'Books' THEN 2500
    WHEN 'Home & Garden' THEN 3500
  END,
  CASE sc.name
    WHEN 'Electronics' THEN 10000
    WHEN 'Fashion' THEN 1500
    WHEN 'Books' THEN 3000
    WHEN 'Home & Garden' THEN 4500
  END,
  20, -- quantity
  ARRAY['https://via.placeholder.com/300x200?text=Buy+Now+Product'],
  true,
  300,
  true,
  true,
  300,
  15,
  4.7,
  false, -- is_auction
  NULL, -- auction_end_time
  false -- is_negotiable
FROM public.shops s
JOIN public.shop_categories sc ON s.id = sc.shop_id
WHERE s.shop_name = 'Test Shop - Product Types'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CREATE TEST BIDS FOR AUCTION PRODUCTS
-- =====================================================

-- Insert test bids for auction products
INSERT INTO public.item_bids (item_id, user_id, bid_amount, bid_time, bid_status)
SELECT 
  si.id,
  u.id,
  si.price + (RANDOM() * 5000 + 1000), -- Random bid amount
  NOW() - INTERVAL '1 day',
  'pending'
FROM public.shop_items si
JOIN public.shops s ON si.shop_id = s.id
JOIN public.users u ON u.role = 'customer'
WHERE s.shop_name = 'Test Shop - Product Types'
  AND si.is_auction = true
  AND u.id IN (SELECT u2.id FROM public.users u2 WHERE u2.role = 'customer' LIMIT 3)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. CREATE TEST REVIEWS
-- =====================================================

-- Insert test product reviews
INSERT INTO public.product_reviews (item_id, user_id, rating, review, created_at)
SELECT 
  si.id,
  u.id,
  (RANDOM() * 2 + 3)::INTEGER, -- Random rating 3-5
  CASE (RANDOM() * 3)::INTEGER
    WHEN 0 THEN 'Great product, highly recommended!'
    WHEN 1 THEN 'Good quality, fast delivery'
    WHEN 2 THEN 'Excellent value for money'
    ELSE 'Very satisfied with this purchase'
  END,
  NOW() - INTERVAL '1 day'
FROM public.shop_items si
JOIN public.shops s ON si.shop_id = s.id
JOIN public.users u ON u.role = 'customer'
WHERE s.shop_name = 'Test Shop - Product Types'
  AND u.id IN (SELECT u2.id FROM public.users u2 WHERE u2.role = 'customer' LIMIT 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. VERIFICATION QUERY
-- =====================================================

-- Show all test products with their types
SELECT 
  si.name,
  si.price,
  si.is_auction,
  si.is_negotiable,
  CASE 
    WHEN si.is_auction THEN 'Auction'
    WHEN si.is_negotiable THEN 'Negotiable'
    ELSE 'Buy Now'
  END as product_type,
  si.auction_end_time,
  si.rating,
  COUNT(ib.id) as bid_count,
  COUNT(pr.id) as review_count
FROM public.shop_items si
JOIN public.shops s ON si.shop_id = s.id
LEFT JOIN public.item_bids ib ON si.id = ib.item_id
LEFT JOIN public.product_reviews pr ON si.id = pr.item_id
WHERE s.shop_name = 'Test Shop - Product Types'
GROUP BY si.id, si.name, si.price, si.is_auction, si.is_negotiable, si.auction_end_time, si.rating
ORDER BY si.is_auction DESC, si.is_negotiable DESC, si.name;

-- =====================================================
-- 6. SUMMARY
-- =====================================================

SELECT 
  'Test Products Created' as message,
  COUNT(*) as total_products,
  'products available for testing' as details
FROM public.shop_items si
JOIN public.shops s ON si.shop_id = s.id
WHERE s.shop_name = 'Test Shop - Product Types'; 