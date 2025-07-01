-- 사용자 인증 정보 확인
SELECT 
    'user_auth 테이블' as table_name,
    id,
    username,
    email,
    name
FROM user_auth 
WHERE id = '6301322c-7813-459e-aedc-791d92bd8fb2';

-- 해당 사용자의 프로필 확인
SELECT 
    'user_profiles 테이블' as table_name,
    id,
    user_auth_id,
    profile_title,
    contact_person_name,
    is_default
FROM user_profiles 
WHERE user_auth_id = '6301322c-7813-459e-aedc-791d92bd8fb2';

-- 모든 user_profiles 데이터 확인 (최근 10개)
SELECT 
    '전체 user_profiles' as table_name,
    id,
    user_auth_id,
    profile_title,
    contact_person_name,
    is_default,
    created_at
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- user_auth와 user_profiles 연결 확인
SELECT 
    '연결 확인' as info,
    ua.id as user_auth_id,
    ua.username,
    ua.email,
    up.id as profile_id,
    up.profile_title,
    up.is_default
FROM user_auth ua
LEFT JOIN user_profiles up ON ua.id = up.user_auth_id
WHERE ua.id = '6301322c-7813-459e-aedc-791d92bd8fb2'; 