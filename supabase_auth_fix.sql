-- =====================================================
-- SUPABASE AUTHENTICATION FIX
-- =====================================================

-- 1. First, let's check what's in the auth.users table
SELECT 
    'Current Auth Users' as info,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check if the pgcrypto extension is available
SELECT 
    'Extensions Check' as info,
    extname,
    extversion
FROM pg_extension 
WHERE extname = 'pgcrypto';

-- 3. Create a completely new test user using proper Supabase approach
-- Delete any existing test users first
DELETE FROM auth.users WHERE email IN ('testuser@adera.com', 'simple@test.com');
DELETE FROM public.users WHERE email IN ('testuser@adera.com', 'simple@test.com');

-- Create new test user with proper password hashing
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
) VALUES (
    gen_random_uuid(),
    'testuser@adera.com',
    crypt('TestPassword123!', gen_salt('bf', 12)),
    NOW(),
    '{"full_name":"Test User","role":"customer","phone_number":"+251911888888"}'::jsonb,
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex')
);

-- 4. Create corresponding profile in public.users
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    wallet_balance,
    is_verified,
    is_active
) 
SELECT 
    au.id,
    au.email,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 2) as last_name,
    (au.raw_user_meta_data->>'role')::user_role,
    au.raw_user_meta_data->>'phone_number',
    1000.00,
    TRUE,
    TRUE
FROM auth.users au
WHERE au.email = 'testuser@adera.com';

-- 5. Test password verification
SELECT 
    'Password Test' as info,
    email,
    crypt('TestPassword123!', encrypted_password) = encrypted_password as password_correct,
    crypt('wrongpassword', encrypted_password) = encrypted_password as password_wrong
FROM auth.users 
WHERE email = 'testuser@adera.com';

-- 6. Reset Abel's user with proper setup
UPDATE auth.users 
SET 
    encrypted_password = crypt('TestPassword123!', gen_salt('bf', 12)),
    email_confirmed_at = NOW(),
    updated_at = NOW(),
    confirmation_token = encode(gen_random_bytes(32), 'hex'),
    recovery_token = encode(gen_random_bytes(32), 'hex')
WHERE email = 'abel.tesfaye@gmail.com';

-- 7. Ensure Abel's profile exists and is properly set
INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    wallet_balance,
    is_verified,
    is_active
) 
SELECT 
    au.id,
    au.email,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
    SPLIT_PART(au.raw_user_meta_data->>'full_name', ' ', 2) as last_name,
    (au.raw_user_meta_data->>'role')::user_role,
    au.raw_user_meta_data->>'phone_number',
    1000.00,
    TRUE,
    TRUE
FROM auth.users au
WHERE au.email = 'abel.tesfaye@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- 8. Verify all users are properly set up
SELECT 
    'Final Verification' as info,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed,
    pu.id IS NOT NULL as profile_exists,
    pu.is_verified,
    pu.is_active
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email IN ('testuser@adera.com', 'abel.tesfaye@gmail.com')
ORDER BY au.email;

-- 9. Show final login credentials
SELECT 
    'LOGIN CREDENTIALS' as header,
    email,
    'TestPassword123!' as password,
    'Use this exact password' as note
FROM auth.users 
WHERE email IN ('testuser@adera.com', 'abel.tesfaye@gmail.com')
ORDER BY email; 