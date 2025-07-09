-- =================================================================
-- user_profiles 테이블에 공공기관/기업 구분 필드 추가
-- =================================================================

-- user_profiles 테이블에 새로운 필드들 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_public_institution boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_company boolean DEFAULT false;

-- 기존 데이터 확인
SELECT 
  id,
  profile_title,
  contact_person_name,
  is_public_institution,
  is_company,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 기본값으로 모든 기존 프로필은 개인용으로 설정
UPDATE user_profiles 
SET 
  is_public_institution = false,
  is_company = false
WHERE is_public_institution IS NULL OR is_company IS NULL;

-- 업데이트 후 데이터 확인
SELECT 
  id,
  profile_title,
  contact_person_name,
  is_public_institution,
  is_company,
  CASE 
    WHEN is_public_institution THEN '공공기관용'
    WHEN is_company THEN '기업용'
    ELSE '개인용'
  END as user_type,
  created_at
FROM user_profiles
ORDER BY created_at DESC; 