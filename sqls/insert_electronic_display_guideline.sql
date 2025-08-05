-- 전자게시대 구별 가이드라인 데이터 삽입
INSERT INTO public.region_gu_guideline (region_gu_id, guideline_image_url, ai_image_url, guideline_type)
SELECT 
  rg.id,
  ARRAY['https://example.com/' || LOWER(rg.name) || '_electronic_guideline1.jpg', 'https://example.com/' || LOWER(rg.name) || '_electronic_guideline2.jpg'],
  'https://example.com/' || LOWER(rg.name) || '_electronic_ai_guideline.jpg',
  'led'
FROM public.region_gu rg
WHERE rg.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND rg.name IN ('강동구', '강북구', '관악구', '광진구','도봉구', '동대문구', '동작구', '마포구', '영등포구', '용산구');

-- 데이터 확인
SELECT 
  rgg.id,
  rg.name as region_name,
  rgg.guideline_image_url,
  rgg.ai_image_url,
  rgg.guideline_type
FROM public.region_gu_guideline rgg
JOIN public.region_gu rg ON rgg.region_gu_id = rg.id
WHERE rgg.guideline_type = 'led'
ORDER BY rg.name; 