-- 1. user_profiles 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_auth_id INTEGER NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    profile_title VARCHAR(100) NOT NULL,
    company_name VARCHAR(200),
    business_registration_number VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_person_name VARCHAR(50) NOT NULL,
    fax_number VARCHAR(20),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. orders 테이블에 user_profile_id 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_profile_id INTEGER REFERENCES user_profiles(id);

-- 3. 기존 사용자들을 위한 기본 프로필 생성
INSERT INTO user_profiles (
    user_auth_id, 
    profile_title, 
    phone, 
    email, 
    contact_person_name, 
    is_default
)
SELECT 
    id as user_auth_id,
    '기본 프로필' as profile_title,
    COALESCE(phone, '') as phone,
    email,
    COALESCE(name, '사용자') as contact_person_name,
    true as is_default
FROM auth_users
WHERE id NOT IN (
    SELECT DISTINCT user_auth_id 
    FROM user_profiles 
    WHERE is_default = true
);

-- 4. 기존 주문들을 기본 프로필에 연결
UPDATE orders 
SET user_profile_id = (
    SELECT id 
    FROM user_profiles 
    WHERE user_profiles.user_auth_id = orders.user_id 
    AND user_profiles.is_default = true
)
WHERE user_profile_id IS NULL;

-- 5. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_auth_id ON user_profiles(user_auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_default ON user_profiles(is_default);
CREATE INDEX IF NOT EXISTS idx_orders_user_profile_id ON orders(user_profile_id);

-- 6. 제약조건 추가 (한 사용자당 하나의 기본 프로필만 허용)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_default_unique 
ON user_profiles(user_auth_id) 
WHERE is_default = true; 