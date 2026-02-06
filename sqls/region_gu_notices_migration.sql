-- region_gu_notices: 구별 유의사항/공지사항 관리 테이블
-- notice_type: 'self_made' (자체제작), 'general' (일반), 'period_deadline' (기간마감) 등
-- items: jsonb 배열 - [{ "text": "내용", "important": true/false }, ...]

-- 기존 테이블이 text[] 타입이면 삭제 후 재생성 (데이터 없는 경우에만 사용)
-- DROP TABLE IF EXISTS public.region_gu_notices;

CREATE TABLE IF NOT EXISTS public.region_gu_notices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid NOT NULL,
  notice_type text NOT NULL,
  title text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT region_gu_notices_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_notices_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id) ON DELETE CASCADE
);

-- 인덱스: region_gu_id + notice_type으로 빠른 조회
CREATE INDEX IF NOT EXISTS idx_region_gu_notices_lookup
  ON public.region_gu_notices (region_gu_id, notice_type, is_active);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_region_gu_notices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_region_gu_notices_updated_at ON public.region_gu_notices;
CREATE TRIGGER trigger_update_region_gu_notices_updated_at
  BEFORE UPDATE ON public.region_gu_notices
  FOR EACH ROW
  EXECUTE FUNCTION update_region_gu_notices_updated_at();

-- 관악구 자체제작 유의사항 초기 데이터 삽입 (관악구 region_gu_id 필요)
-- INSERT INTO public.region_gu_notices (region_gu_id, notice_type, title, items, is_active, display_order)
-- SELECT id, 'self_made', '부분대행 접수시 주의사항',
--   ARRAY['타 업체에서 제작한 현수막을 부분대행으로 접수하실 경우, 규격 및 디자인 가이드라인 준수 여부를 반드시 확인해주세요.'],
--   true, 0
-- FROM public.region_gu
-- WHERE name = '관악구' AND display_type_id = (SELECT id FROM display_types WHERE name = 'banner_display');
