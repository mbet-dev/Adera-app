-- =====================================================
-- DEBUG AUTHENTICATION ISSUES
-- =====================================================

-- 1. Check if users exist in auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email LIKE '%abel%' OR email LIKE '%test%'
ORDER BY created_at DESC;

-- 2. Check if user profiles exist in public.users
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    phone
FROM public.users 
WHERE email LIKE '%abel%' OR email LIKE '%test%'
ORDER BY created_at DESC;

-- 3. Create a simple test user with proper authentication
-- First, delete any existing test user
DELETE FROM auth.users WHERE email = 'test@adera.com';
DELETE FROM public.users WHERE email = 'test@adera.com';

-- Create test user in auth.users
INSERT INTO auth.users (
    id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    raw_user_meta_data, 
    created_at, 
    updated_at
) VALUES (
    uuid_generate_v4(),
    'test@adera.com',
    crypt('test123', gen_salt('bf')),
    NOW(),
    '{"full_name":"Test User","role":"customer","phone_number":"+251911000000"}'::jsonb,
    NOW(),
    NOW()
);

-- Create corresponding profile in public.users
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    wallet_balance
) 
SELECT 
    au.id,
    au.email,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 2) as last_name,
    (au.raw_user_meta_data->>'role')::user_role,
    au.raw_user_meta_data->>'phone_number',
    1000.00
FROM auth.users au
WHERE au.email = 'test@adera.com';

-- 4. Verify the test user was created
SELECT 
    'Auth Users' as table_name,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'test@adera.com'

UNION ALL

SELECT 
    'Public Users' as table_name,
    COUNT(*) as count
FROM public.users 
WHERE email = 'test@adera.com';

-- 5. Show all available users for testing
SELECT 
    'Available Test Users' as info,
    email,
    raw_user_meta_data->>'role' as role,
    email_confirmed_at
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- 6. Test password verification (this should return true for correct password)
SELECT 
    email,
    crypt('test123', encrypted_password) = encrypted_password as password_matches
FROM auth.users 
WHERE email = 'test@adera.com'; 