
-- This script is idempotent and can be run multiple times without creating duplicate data.

DO $$
DECLARE
    -- Array of new categories to be added
    new_categories TEXT[] := ARRAY[
        'Electronics', 'Fashion', 'Books', 'Home & Garden', 
        'Health & Beauty', 'Toys & Games', 'Automotive', 'Sports & Outdoors'
    ];
    category_name TEXT;
    category_id UUID;
    shop_id_fixed UUID := '7ce6560c-6265-4d11-a577-70d703561e35'; -- Using a fixed shop_id for all new categories and items

    -- Arrays of products for each category
    products_electronics TEXT[] := ARRAY[
        'Samsung Galaxy S25', 'Tecno Phantom V Fold', 'Infinix Note 40 Pro', 'Apple MacBook Pro 16"',
        'Dell XPS 15', 'HP Spectre x360', 'Sony WH-1000XM5 Headphones', 'Anker Power Bank'
    ];
    products_fashion TEXT[] := ARRAY[
        'Men''s Leather Jacket', 'Women''s Summer Dress', 'Habesha Kemis', 'Gabi Traditional Shawl',
        'Leather Shoes', 'Handmade Scarf', 'Silver Necklace', 'Beaded Bracelet'
    ];
    products_books TEXT[] := ARRAY[
        'Fikir Eske Mekabir', 'Oromay', 'The Shadow of the Wind', 'Sapiens: A Brief History of Humankind',
        'Atomic Habits', 'The Alchemist', '1984', 'To Kill a Mockingbird'
    ];
    products_home_garden TEXT[] := ARRAY[
        'Coffee Ceremony Set', 'Jebena (Coffee Pot)', 'Woven Basket', 'Clay Cooking Pot',
        'Garden Tool Set', 'Indoor Plant Pot', 'Scented Candles', 'Wall Art'
    ];
    products_health_beauty TEXT[] := ARRAY[
        'Shea Butter Body Cream', 'Black Seed Oil', 'Handmade Soap', 'Essential Oil Diffuser',
        'Yoga Mat', 'Dumbbell Set', 'Makeup Kit', 'Perfume'
    ];
    products_toys_games TEXT[] := ARRAY[
        'Gebeta Board Game', 'Sega (Game)', 'Handmade Doll', 'Wooden Blocks',
        'Soccer Ball', 'Jump Rope', 'Puzzles', 'Art Supplies for Kids'
    ];
    products_automotive TEXT[] := ARRAY[
        'Car Seat Covers', 'Floor Mats', 'Phone Holder', 'Tire Inflator',
        'Jump Starter', 'Car Freshener', 'Microfiber Cleaning Cloths', 'Engine Oil'
    ];
    products_sports_outdoors TEXT[] := ARRAY[
        'Camping Tent', 'Hiking Backpack', 'Running Shoes', 'Bicycle',
        'Basketball', 'Fishing Rod', 'Yoga Mat', 'Water Bottle'
    ];

    product_name TEXT;
    product_description TEXT;
    product_price DECIMAL;
    product_image TEXT;

BEGIN
    -- Loop through each category and insert it if it doesn't exist
    FOREACH category_name IN ARRAY new_categories
    LOOP
        -- Insert category and get the id
        INSERT INTO public.shop_categories (shop_id, name, icon_url, sort_order)
        VALUES (shop_id_fixed, category_name, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100', 1)
        ON CONFLICT (name, shop_id) DO NOTHING;

        -- Get the category_id of the newly inserted or existing category
        SELECT id INTO category_id FROM public.shop_categories WHERE name = category_name AND shop_id = shop_id_fixed;

        -- Insert products for each category
        CASE category_name
            WHEN 'Electronics' THEN
                FOREACH product_name IN ARRAY products_electronics
                LOOP
                    product_description := 'High-quality ' || product_name || ' from Ethiopia.';
                    product_price := 1000 + (RANDOM() * 9000);
                    product_image := 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Fashion' THEN
                FOREACH product_name IN ARRAY products_fashion
                LOOP
                    product_description := 'Stylish ' || product_name || ' made with the finest materials.';
                    product_price := 500 + (RANDOM() * 4500);
                    product_image := 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Books' THEN
                FOREACH product_name IN ARRAY products_books
                LOOP
                    product_description := 'A captivating book: ' || product_name;
                    product_price := 200 + (RANDOM() * 800);
                    product_image := 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Home & Garden' THEN
                FOREACH product_name IN ARRAY products_home_garden
                LOOP
                    product_description := 'Beautiful ' || product_name || ' to decorate your home.';
                    product_price := 300 + (RANDOM() * 2700);
                    product_image := 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Health & Beauty' THEN
                FOREACH product_name IN ARRAY products_health_beauty
                LOOP
                    product_description := 'Organic ' || product_name || ' for a healthy lifestyle.';
                    product_price := 150 + (RANDOM() * 1350);
                    product_image := 'https://images.unsplash.com/photo-1540555233499-934b3aadd863?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Toys & Games' THEN
                FOREACH product_name IN ARRAY products_toys_games
                LOOP
                    product_description := 'Fun and educational ' || product_name || ' for all ages.';
                    product_price := 100 + (RANDOM() * 900);
                    product_image := 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Automotive' THEN
                FOREACH product_name IN ARRAY products_automotive
                LOOP
                    product_description := 'High-quality ' || product_name || ' for your vehicle.';
                    product_price := 400 + (RANDOM() * 3600);
                    product_image := 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
            WHEN 'Sports & Outdoors' THEN
                FOREACH product_name IN ARRAY products_sports_outdoors
                LOOP
                    product_description := 'Durable ' || product_name || ' for your next adventure.';
                    product_price := 600 + (RANDOM() * 5400);
                    product_image := 'https://images.unsplash.com/photo-1552674605-db6ffd5e259b?w=400';
                    INSERT INTO public.shop_items (shop_id, category_id, name, description, price, main_image_url, image_urls)
                    VALUES (shop_id_fixed, category_id, product_name, product_description, product_price, product_image, ARRAY[product_image])
                    ON CONFLICT (name, shop_id) DO NOTHING;
                END LOOP;
        END CASE;
    END LOOP;
END $$;
