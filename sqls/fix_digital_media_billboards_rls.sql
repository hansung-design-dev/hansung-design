-- ====================================
-- digital_media_billboards 테이블 RLS 정책 설정
-- ====================================

-- RLS 활성화 확인 및 공개 읽기 정책 추가
-- 모든 사용자가 is_active=true인 데이터를 읽을 수 있도록 설정

-- 1. RLS 활성화 (이미 활성화되어 있어도 안전)
ALTER TABLE public.digital_media_billboards ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Allow public read access for active digital_media_billboards" ON public.digital_media_billboards;

-- 3. 공개 읽기 정책 추가 (is_active=true인 데이터만)
CREATE POLICY "Allow public read access for active digital_media_billboards"
ON public.digital_media_billboards
FOR SELECT
USING (is_active = true);

-- 4. 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'digital_media_billboards';

