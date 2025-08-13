-- 동작구 전자게시대 누락된 패널들 데이터 삽입
-- panel_code: 3, 11, 12, 13, 14, 15

-- 1. led_display_price_policy 테이블에 데이터 삽입
INSERT INTO public.led_display_price_policy (
  panel_id,
  price_usage_type,
  tax_price,
  road_usage_fee,
  advertising_fee,
  total_price,
  vat_amount,
  vat_price
)
SELECT 
  p.id as panel_id,
  'default'::price_usage_type as price_usage_type,
  0 as tax_price,
  0 as road_usage_fee,
  0 as advertising_fee,
  CASE 
    WHEN p.panel_code = 3 THEN 0
    WHEN p.panel_code IN (11, 12, 13, 14, 15) THEN 72600
    ELSE 0
  END as total_price,
  0 as vat_amount,
  0 as vat_price
FROM public.panels p
JOIN public.region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '동작구' 
  AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND p.panel_code IN (3, 11, 12, 13, 14, 15)
  AND p.panel_type = 'led'
  AND NOT EXISTS (
    SELECT 1 FROM public.led_display_price_policy lpp 
    WHERE lpp.panel_id = p.id
  );

-- 2. led_panel_details 테이블에 데이터 삽입
INSERT INTO public.led_panel_details (
  panel_id,
  exposure_count,
  panel_width,
  panel_height,
  max_banners
)
SELECT 
  p.id as panel_id,
  0 as exposure_count,
  1 as panel_width,
  1 as panel_height,
  20 as max_banners
FROM public.panels p
JOIN public.region_gu rg ON p.region_gu_id = rg.id
WHERE rg.name = '동작구' 
  AND p.display_type_id = '3119f6ed-81e4-4d62-b785-6a33bc7928f9'
  AND p.panel_code IN (3, 11, 12, 13, 14, 15)
  AND p.panel_type = 'led'
  AND NOT EXISTS (
    SELECT 1 FROM public.led_panel_details lpd 
    WHERE lpd.panel_id = p.id
  );
