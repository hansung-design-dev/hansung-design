-- LED 게시대 가격정책 데이터 삽입 (기존 led_display_price_policy 테이블 사용)
INSERT INTO public.led_display_price_policy (panel_info_id, price_usage_type, tax_price, road_usage_fee, advertising_fee, total_price) 
SELECT 
  pi.id as panel_info_id,
  'default'::price_usage_type as price_usage_type,
  0 as tax_price,
  0 as road_usage_fee,
  CASE rg.name
    WHEN '광진구' THEN 561000
    WHEN '강동구' THEN 561000
    WHEN '동대문구' THEN 561000
    WHEN '강북구' THEN 561000
    WHEN '관악구' THEN 363000
    WHEN '동작구' THEN 380600
    WHEN '마포구' THEN 380600
    ELSE 0
  END as advertising_fee,
  CASE rg.name
    WHEN '광진구' THEN 561000
    WHEN '강동구' THEN 561000
    WHEN '동대문구' THEN 561000
    WHEN '강북구' THEN 561000
    WHEN '관악구' THEN 363000
    WHEN '동작구' THEN 380600
    WHEN '마포구' THEN 380600
    ELSE 0
  END as total_price
FROM public.panel_info pi
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.display_type_id = (SELECT id FROM public.display_types WHERE name = 'LED전자게시대')
  AND rg.name IN ('광진구', '강동구', '동대문구', '강북구', '관악구', '동작구', '마포구')
ON CONFLICT (panel_info_id) 
DO UPDATE SET 
  advertising_fee = EXCLUDED.advertising_fee,
  total_price = EXCLUDED.total_price,
  updated_at = now();

-- 가격정책 조회를 위한 뷰 생성
CREATE OR REPLACE VIEW public.led_price_policy_view AS
SELECT 
  rg.name as district_name,
  pi.id as panel_info_id,
  ldpp.advertising_fee,
  ldpp.total_price,
  ldpp.created_at,
  ldpp.updated_at
FROM public.led_display_price_policy ldpp
JOIN public.panel_info pi ON ldpp.panel_info_id = pi.id
JOIN public.region_gu rg ON pi.region_gu_id = rg.id
WHERE pi.display_type_id = (SELECT id FROM public.display_types WHERE name = 'LED전자게시대')
ORDER BY rg.name; 