-- =====================================================
-- COMPLETE AUTHENTICATION FIX FOR SUPABASE
-- =====================================================

-- 1. Check current state
SELECT 
    'Current State' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- 2. Clear any problematic test users
DELETE FROM auth.users WHERE email IN (
    'testuser@adera.com', 
    'simple@test.com', 
    'test@adera.com',
    'debug@test.com'
);
DELETE FROM public.users WHERE email IN (
    'testuser@adera.com', 
    'simple@test.com', 
    'test@adera.com',
    'debug@test.com'
);

-- 3. Create a proper test user using Supabase's recommended approach
-- This mimics what happens when a user signs up through the UI
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'test@adera.com',
    crypt('TestPassword123!', gen_salt('bf', 12)),
    NOW(),
    '{"full_name":"Test User","role":"customer","phone_number":"+251911777777"}'::jsonb,
    NOW(),
    NOW(),
    encode(gen_random_bytes(32), 'hex'),
    encode(gen_random_bytes(32), 'hex'),
    'authenticated',
    'authenticated'
);

-- 4. Create corresponding profile
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
WHERE au.email = 'test@adera.com';

-- 5. Fix Abel's user completely
UPDATE auth.users 
SET 
    encrypted_password = crypt('TestPassword123!', gen_salt('bf', 12)),
    email_confirmed_at = NOW(),
    updated_at = NOW(),
    confirmation_token = encode(gen_random_bytes(32), 'hex'),
    recovery_token = encode(gen_random_bytes(32), 'hex'),
    aud = 'authenticated',
    role = 'authenticated'
WHERE email = 'abel.tesfaye@gmail.com';

-- 6. Ensure Abel's profile is correct
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

-- 7. Test password verification
SELECT 
    'Password Verification Test' as info,
    email,
    crypt('TestPassword123!', encrypted_password) = encrypted_password as correct_password_works,
    crypt('wrongpassword', encrypted_password) = encrypted_password as wrong_password_fails,
    email_confirmed_at IS NOT NULL as email_confirmed,
    aud,
    role
FROM auth.users 
WHERE email IN ('test@adera.com', 'abel.tesfaye@gmail.com')
ORDER BY email;

-- 8. Verify complete setup
SELECT 
    'Complete Setup Verification' as info,
    au.email,
    au.email_confirmed_at IS NOT NULL as auth_confirmed,
    pu.id IS NOT NULL as profile_exists,
    pu.is_verified,
    pu.is_active,
    au.aud,
    au.role
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email IN ('test@adera.com', 'abel.tesfaye@gmail.com')
ORDER BY au.email;

-- 9. Show final credentials
SELECT 
    '=== LOGIN CREDENTIALS ===' as header,
    email,
    'TestPassword123!' as password,
    'Use exactly this password' as note
FROM auth.users 
WHERE email IN ('test@adera.com', 'abel.tesfaye@gmail.com')
ORDER BY email;

-- 10. Additional debug info
SELECT 
    'Debug Info' as info,
    'pgcrypto available' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result

UNION ALL

SELECT 
    'Debug Info' as info,
    'uuid-ossp available' as check,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') 
        THEN 'YES' 
        ELSE 'NO' 
    END as result; 