-- =====================================================
-- FIX AUTHENTICATION ISSUES
-- =====================================================

-- 1. Reset password for abel.tesfaye@gmail.com
UPDATE auth.users 
SET 
    encrypted_password = crypt('test123', gen_salt('bf')),
    email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'abel.tesfaye@gmail.com';

-- 2. Ensure the user profile exists in public.users
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
WHERE au.email = 'abel.tesfaye@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- 3. Create a simple test user with basic password
-- First delete if exists
DELETE FROM auth.users WHERE email = 'simple@test.com';
DELETE FROM public.users WHERE email = 'simple@test.com';

-- Then insert new user
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
    'simple@test.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"full_name":"Simple Test","role":"customer","phone_number":"+251911999999"}'::jsonb,
    NOW(),
    NOW()
);

-- 4. Create corresponding profile
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
WHERE au.email = 'simple@test.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- 5. Verify the fixes
SELECT 
    'Fixed Users' as status,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
WHERE email IN ('abel.tesfaye@gmail.com', 'simple@test.com')
ORDER BY email;

-- 6. Show login credentials
SELECT 
    'Login Credentials' as info,
    email,
    'test123' as password_for_abel,
    'password123' as password_for_simple
FROM auth.users 
WHERE email IN ('abel.tesfaye@gmail.com', 'simple@test.com')
ORDER BY email; 