-- Fix: DB에 phone_verification_purpose_enum 값이 누락되어
-- "invalid input value for enum phone_verification_purpose_enum: \"add_profile\"" 에러가 나는 경우를 위한 보정 스크립트입니다.
--
-- 대상 에러 발생 위치 예:
-- - src/app/api/user-profiles/route.ts (purpose: 'profile')
-- - src/app/api/user-profiles/[id]/route.ts (purpose: 'profile')
--
-- 실행: Supabase SQL Editor 또는 psql에서 그대로 실행

DO $$
BEGIN
  -- Postgres 12+ 에서는 IF NOT EXISTS 지원
  ALTER TYPE phone_verification_purpose_enum ADD VALUE IF NOT EXISTS 'add_profile';
EXCEPTION
  WHEN duplicate_object THEN
    -- 이미 존재하면 무시
    NULL;
END $$;


