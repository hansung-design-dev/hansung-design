-- LED 게시대 구별 카드 상담문의 전화번호를 1533-0570으로 통일
-- LED 전자게시대가 있는 구들의 전화번호를 업데이트

UPDATE public.region_gu 
SET phone_number = '1533-0570'
WHERE id IN (
  SELECT DISTINCT rg.id
  FROM public.region_gu rg
  JOIN public.panel_info pi ON rg.id = pi.region_gu_id
  JOIN public.display_types dt ON pi.display_type_id = dt.id
  WHERE dt.name = 'LED전자게시대'
    AND pi.panel_status IN ('active', 'maintenance')
    AND rg.is_active = true
);

-- 업데이트된 구 목록 확인
SELECT 
  rg.name as district_name,
  rg.phone_number,
  COUNT(pi.id) as led_panel_count
FROM public.region_gu rg
JOIN public.panel_info pi ON rg.id = pi.region_gu_id
JOIN public.display_types dt ON pi.display_type_id = dt.id
WHERE dt.name = 'LED전자게시대'
  AND pi.panel_status IN ('active', 'maintenance')
  AND rg.is_active = true
GROUP BY rg.id, rg.name, rg.phone_number
ORDER BY rg.name; 