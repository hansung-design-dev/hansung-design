-- 행정용 계정 승인 기능을 위한 컬럼 추가
-- 실행 날짜: 2026-02-06

-- rejection_reason: 승인 거절 사유
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- approved_at: 승인 처리 일시
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- 기존 행정용 프로필 중 is_approved가 true인 경우 approved_at 업데이트 (선택사항)
-- UPDATE public.user_profiles
-- SET approved_at = updated_at
-- WHERE is_public_institution = true AND is_approved = true AND approved_at IS NULL;
