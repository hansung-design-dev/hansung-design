-- panel_guideline 테이블을 region_gu_guideline으로 변경하는 마이그레이션

-- 1. 기존 테이블 삭제 (데이터 백업이 필요한 경우 먼저 백업)
DROP TABLE IF EXISTS public.panel_guideline CASCADE;

-- 2. 새로운 테이블 생성
CREATE TABLE public.region_gu_guideline (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  region_gu_id uuid,
  guideline_image_url text[],
  ai_image_url text,
  guideline_type guideline_panel_type,
  CONSTRAINT region_gu_guideline_pkey PRIMARY KEY (id),
  CONSTRAINT region_gu_guideline_region_gu_id_fkey FOREIGN KEY (region_gu_id) REFERENCES public.region_gu(id)
);

-- 3. 인덱스 생성 (필요한 경우)
CREATE INDEX idx_region_gu_guideline_region_gu_id ON public.region_gu_guideline(region_gu_id);
CREATE INDEX idx_region_gu_guideline_guideline_type ON public.region_gu_guideline(guideline_type);

-- 4. 권한 설정 (필요한 경우)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.region_gu_guideline TO authenticated;

-- 5. 현수막게시대 구별 가이드라인 데이터 삽입
INSERT INTO public.region_gu_guideline (region_gu_id, guideline_image_url, ai_image_url, guideline_type)
SELECT 
  rg.id,
  ARRAY['https://example.com/' || LOWER(rg.name) || '_guideline1.jpg', 'https://example.com/' || LOWER(rg.name) || '_guideline2.jpg'],
  'https://example.com/' || LOWER(rg.name) || '_ai_guideline.jpg',
  'banner'
FROM public.region_gu rg
WHERE rg.display_type_id = '8178084e-1f13-40bc-8b90-7b8ddc58bf64'
  AND rg.name IN ('관악구', '마포구', '서대문구', '송파구', '용산구');

-- 6. 데이터 확인
SELECT 
  rgg.id,
  rg.name as region_name,
  rgg.guideline_image_url,
  rgg.ai_image_url,
  rgg.guideline_type
FROM public.region_gu_guideline rgg
JOIN public.region_gu rg ON rgg.region_gu_id = rg.id
ORDER BY rg.name; 