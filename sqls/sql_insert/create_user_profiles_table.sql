-- =================================================================
-- user_profiles 테이블 생성
-- =================================================================

-- 간편정보 테이블 생성
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_auth_id uuid REFERENCES user_auth(id) ON DELETE CASCADE,
  profile_title text NOT NULL, -- "기본 프로필", "한성 디자인팀", "회사A" 등
  company_name text, -- 회사명 (개인인 경우 NULL)
  business_registration_number text, -- 사업자등록번호 (개인인 경우 NULL)
  phone text NOT NULL,
  email text NOT NULL,
  contact_person_name text NOT NULL, -- 담당자명
  fax_number text, -- 팩스번호 (선택사항)
  is_default boolean DEFAULT false, -- 기본 프로필 여부
  created_at timestamp DEFAULT NOW(),
  updated_at timestamp DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_profiles_user_auth_id ON user_profiles(user_auth_id);
CREATE INDEX idx_user_profiles_default ON user_profiles(user_auth_id, is_default);

-- =================================================================
-- orders 테이블에 user_profile_id 컬럼 추가
-- =================================================================

-- orders 테이블에 user_profile_id 컬럼 추가
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_profile_id uuid REFERENCES user_profiles(id);

-- =================================================================
-- 기존 테스트 유저를 위한 기본 프로필 생성
-- =================================================================

-- 기존 사용자 정보 확인
SELECT id, username, email, name, phone FROM user_auth;

-- 기존 사용자를 위한 기본 프로필 생성 (테스트 유저 기준)
INSERT INTO user_profiles (
  user_auth_id, 
  profile_title, 
  phone, 
  email, 
  contact_person_name, 
  is_default
)
SELECT 
  id, 
  '기본 프로필', 
  COALESCE(phone, '010-1234-5678'), -- 테스트 유저 전화번호로 기본값 설정
  email, 
  name, 
  true
FROM user_auth
WHERE username = 'testsung'; -- 테스트 유저만 대상으로

-- 생성된 기본 프로필 확인
SELECT 
  up.id as profile_id,
  up.profile_title,
  up.contact_person_name,
  up.phone,
  up.email,
  up.is_default,
  ua.username,
  ua.name as user_name
FROM user_profiles up
JOIN user_auth ua ON up.user_auth_id = ua.id;

-- =================================================================
-- 기존 주문들에 기본 프로필 연결
-- =================================================================

-- 기존 주문들에 기본 프로필 ID 업데이트
UPDATE orders 
SET user_profile_id = (
  SELECT up.id 
  FROM user_profiles up 
  JOIN user_auth ua ON up.user_auth_id = ua.id 
  WHERE up.is_default = true AND ua.id = orders.user_id
)
WHERE user_profile_id IS NULL AND user_id IS NOT NULL;

-- 업데이트 결과 확인
SELECT 
  o.id as order_id,
  o.total_price,
  o.depositor_name,
  o.user_profile_id,
  up.profile_title,
  up.contact_person_name
FROM orders o
LEFT JOIN user_profiles up ON o.user_profile_id = up.id
ORDER BY o.created_at DESC; 